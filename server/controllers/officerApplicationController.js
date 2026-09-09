const Application = require("../models/Application");
const HousingScheme = require("../models/HousingScheme");

// ======================================================
// GET APPLICATIONS FOR OFFICER
// ======================================================
// Officer can only see applications belonging to
// schemes assigned to that officer.
//
// Admin creates the scheme and assigns the officer.
// Officer does NOT create or modify the scheme's
// fixed details.
//
// Fixed scheme details controlled by Admin:
// - Scheme name
// - Description
// - Eligible income categories
// - Maximum annual income
// - House model
// - House price
//
// Operational details configured by Officer:
// - Total units
// - Location
// - Application period

const getOfficerApplications = async (req, res) => {
  try {
    const officerId = req.user.userId;

    // ==================================================
    // FIND SCHEMES ASSIGNED TO THIS OFFICER
    // ==================================================

    const schemes = await HousingScheme.find({
      assignedOfficer: officerId,
    }).select("_id");

    const schemeIds = schemes.map(
      (scheme) => scheme._id
    );

    // ==================================================
    // FIND APPLICATIONS
    // ==================================================

    const applications = await Application.find({
      schemeId: {
        $in: schemeIds,
      },
    })
      .populate(
        "applicantId",
        "name email phone district"
      )
      .populate(
        "schemeId",
        `
        schemeName
        description
        eligibleIncomeCategories
        maximumAnnualIncome
        houseModel
        price
        location
        totalUnits
        availableUnits
        applicationStartDate
        applicationEndDate
        status
        assignedOfficer
        `
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      applications,
    });
  } catch (error) {
    console.error(
      "Get officer applications error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching applications.",
    });
  }
};


// ======================================================
// GET SINGLE APPLICATION
// ======================================================
// Officer can view an application only when its
// housing scheme is assigned to that officer.

const getOfficerApplicationById = async (req, res) => {
  try {
    const officerId = req.user.userId;

    const { applicationId } = req.params;

    // ==================================================
    // FIND APPLICATION
    // ==================================================

    const application = await Application.findById(
      applicationId
    )
      .populate(
        "applicantId",
        "name email phone district"
      )
      .populate({
        path: "schemeId",
        select: `
          schemeName
          description
          eligibleIncomeCategories
          maximumAnnualIncome
          houseModel
          price
          location
          totalUnits
          availableUnits
          applicationStartDate
          applicationEndDate
          status
          assignedOfficer
        `,
      });

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // ==================================================
    // CHECK OFFICER ASSIGNMENT
    // ==================================================

    if (
      !application.schemeId ||
      application.schemeId.assignedOfficer?.toString() !==
        officerId.toString()
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to view this application.",
      });
    }

    res.status(200).json({
      application,
    });
  } catch (error) {
    console.error(
      "Get officer application error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching application.",
    });
  }
};


// ======================================================
// VERIFY APPLICATION
// ======================================================
// Officer performs application verification.
//
// ELIGIBLE
//     -> Applicant satisfies the Admin-defined
//        scheme eligibility rules.
//     -> Application becomes eligible for ranking.
//
// REJECTED
//     -> Application is rejected.
//     -> Application will NOT participate in ranking.
//
// IMPORTANT:
// Ranking is NOT generated here.
//
// Ranking happens only after the application period
// closes.
//
// Waiting-list positions are also NOT generated here.
//
// Allotment is NOT generated here.

const verifyApplication = async (req, res) => {
  try {
    const officerId = req.user.userId;

    const { applicationId } = req.params;

    const {
      status,
      verificationRemarks,
    } = req.body;

    // ==================================================
    // VALIDATE STATUS
    // ==================================================

    if (
      !["ELIGIBLE", "REJECTED"].includes(status)
    ) {
      return res.status(400).json({
        message:
          "Status must be either ELIGIBLE or REJECTED.",
      });
    }

    // ==================================================
    // REJECTION FEEDBACK REQUIRED
    // ==================================================

    if (
      status === "REJECTED" &&
      (!verificationRemarks ||
        !verificationRemarks.trim())
    ) {
      return res.status(400).json({
        message:
          "Please provide feedback when rejecting an application.",
      });
    }

    // ==================================================
    // FIND APPLICATION
    // ==================================================

    const application =
      await Application.findById(
        applicationId
      ).populate("schemeId");

    if (!application) {
      return res.status(404).json({
        message:
          "Application not found.",
      });
    }

    // ==================================================
    // FIND ASSOCIATED SCHEME
    // ==================================================

    const scheme = application.schemeId;

    if (!scheme) {
      return res.status(404).json({
        message:
          "Housing scheme associated with this application was not found.",
      });
    }

    // ==================================================
    // CHECK OFFICER ASSIGNMENT
    // ==================================================

    if (
      scheme.assignedOfficer?.toString() !==
      officerId.toString()
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to process this application.",
      });
    }

    // ==================================================
    // APPLICATION MUST BE SUBMITTED
    // ==================================================
    // Only submitted / under-verification applications
    // can be processed by the officer.

    if (
      ![
        "SUBMITTED",
        "UNDER_VERIFICATION",
      ].includes(application.status)
    ) {
      return res.status(400).json({
        message:
          "This application has already been processed.",
      });
    }

    // ==================================================
    // VALIDATE APPLICATION PERIOD
    // ==================================================
    // Officer cannot verify an application before
    // the scheme application period starts.

    const now = new Date();

    if (
      scheme.applicationStartDate &&
      now <
        new Date(
          scheme.applicationStartDate
        )
    ) {
      return res.status(400).json({
        message:
          "The application period has not started yet.",
      });
    }

    // ==================================================
    // CHECK ADMIN-DEFINED ELIGIBILITY
    // ==================================================
    //
    // Example:
    //
    // Anna Housing Scheme
    // -------------------
    // Eligible Category: EWS
    // Maximum Income: ₹2,00,000
    //
    // Gandhi Housing Scheme
    // ---------------------
    // Eligible Category: LIG
    // Maximum Income: ₹4,00,000
    //
    // These values come from HousingScheme.
    //
    // Officer cannot change these rules.
    // Applicant cannot change these rules.
    //
    // ==================================================

    const eligibleCategories =
      scheme.eligibleIncomeCategories || [];

    const applicantCategory =
      application.incomeCategory;

    const categoryAllowed =
      eligibleCategories.includes(
        applicantCategory
      );

    const incomeAllowed =
      Number(application.annualIncome) <=
      Number(scheme.maximumAnnualIncome);

    // ==================================================
    // APPROVAL VALIDATION
    // ==================================================
    // Officer can approve only when the applicant
    // satisfies the fixed scheme eligibility.

    if (status === "ELIGIBLE") {
      if (!categoryAllowed) {
        return res.status(400).json({
          message:
            `Applicant income category (${applicantCategory}) ` +
            `is not eligible for this housing scheme.`,
        });
      }

      if (!incomeAllowed) {
        return res.status(400).json({
          message:
            "Applicant annual income exceeds the maximum income limit for this housing scheme.",
        });
      }
    }

    // ==================================================
    // UPDATE APPLICATION
    // ==================================================

    application.status = status;

    application.verifiedBy = officerId;

    application.verifiedAt = new Date();

    application.verificationRemarks =
      verificationRemarks?.trim() || "";

    await application.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(200).json({
      message:
        status === "ELIGIBLE"
          ? "Application approved successfully. It will be considered for ranking after the application period closes."
          : "Application rejected successfully.",

      application,
    });
  } catch (error) {
    console.error(
      "Verify application error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while verifying application.",
    });
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getOfficerApplications,
  getOfficerApplicationById,
  verifyApplication,
};