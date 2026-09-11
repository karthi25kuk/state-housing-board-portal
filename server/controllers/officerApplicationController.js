const Application = require("../models/Application");
const HousingScheme = require("../models/HousingScheme");
const WaitingList = require("../models/WaitingList");
const {
  recalculateWaitingList,
} = require("./waitingListController");

// ======================================================
// HELPER
// ======================================================

const normalizeDistrict = (district) => {
  return district?.trim().toLowerCase();
};

// ======================================================
// GET APPLICATIONS FOR OFFICER
// ======================================================
//
// Officer can see ONLY applications belonging to the
// Officer's district.
//
// Access is based on:
//
//     application.district
//             ===
//     officer.district
//
// Scheme configuration is NOT used for access.
//
// An applicant can apply before the Officer configures
// the scheme for the district.
// ======================================================

const getOfficerApplications = async (req, res) => {
  try {
    const officerDistrict = req.user.district;

    // ==================================================
    // VALIDATE OFFICER DISTRICT
    // ==================================================

    if (
      !officerDistrict ||
      !officerDistrict.trim()
    ) {
      return res.status(400).json({
        message:
          "Officer district is not configured.",
      });
    }

    const normalizedOfficerDistrict =
      normalizeDistrict(officerDistrict);

    // ==================================================
    // FIND APPLICATIONS
    // ==================================================

    const applications =
      await Application.find({
        district: {
          $regex: `^${officerDistrict.trim()}$`,
          $options: "i",
        },
      })
        .populate(
          "applicantId",
          "name email phone district housingStatus"
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
            configurations
            createdBy
          `,
        })
        .sort({
          createdAt: -1,
        });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      applications,
    });
  } catch (error) {
    console.error(
      "Get officer applications error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching applications.",
    });
  }
};

// ======================================================
// GET SINGLE APPLICATION
// ======================================================
//
// Officer can view an application ONLY when its
// district matches the Officer's district.
// ======================================================

const getOfficerApplicationById = async (
  req,
  res
) => {
  try {
    const officerDistrict = req.user.district;
    const { applicationId } = req.params;

    // ==================================================
    // VALIDATE OFFICER DISTRICT
    // ==================================================

    if (
      !officerDistrict ||
      !officerDistrict.trim()
    ) {
      return res.status(400).json({
        message:
          "Officer district is not configured.",
      });
    }

    // ==================================================
    // FIND APPLICATION
    // ==================================================

    const application =
      await Application.findById(
        applicationId
      )
        .populate(
          "applicantId",
          "name email phone district housingStatus"
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
            configurations
            createdBy
          `,
        });

    // ==================================================
    // APPLICATION NOT FOUND
    // ==================================================

    if (!application) {
      return res.status(404).json({
        message:
          "Application not found.",
      });
    }

    // ==================================================
    // CHECK DISTRICT ACCESS
    // ==================================================

    if (
      normalizeDistrict(
        application.district
      ) !==
      normalizeDistrict(
        officerDistrict
      )
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to view applications from another district.",
      });
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      application,
    });
  } catch (error) {
    console.error(
      "Get officer application error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching application.",
    });
  }
};

// ======================================================
// VERIFY APPLICATION
// ======================================================
//
// FINAL WORKFLOW:
//
// SUBMITTED
//     ↓
// Officer verification
//     ↓
// ┌────────────────┐
// │                │
// ▼                ▼
// ELIGIBLE       REJECTED
// │
// ▼
// WaitingList ACTIVE
// │
// ▼
// District ranking
//
// IMPORTANT:
//
// A district configuration is NOT required for
// verification or ranking.
//
// The applicant can apply and become eligible before
// the Officer configures housing.
//
// Configuration is required later for ALLOTMENT.
//
// ======================================================

const verifyApplication = async (
  req,
  res
) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    const { applicationId } = req.params;

    const {
      status,
      verificationRemarks,
    } = req.body;

    // ==================================================
    // VALIDATE OFFICER DISTRICT
    // ==================================================

    if (
      !officerDistrict ||
      !officerDistrict.trim()
    ) {
      return res.status(400).json({
        message:
          "Officer district is not configured.",
      });
    }

    const normalizedOfficerDistrict =
      normalizeDistrict(officerDistrict);

    // ==================================================
    // VALIDATE STATUS
    // ==================================================

    if (
      !["ELIGIBLE", "REJECTED"].includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          "Status must be either ELIGIBLE or REJECTED.",
      });
    }

    // ==================================================
    // VALIDATE REJECTION REMARKS
    // ==================================================

    if (
      status === "REJECTED" &&
      (
        !verificationRemarks ||
        !verificationRemarks.trim()
      )
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
      );

    if (!application) {
      return res.status(404).json({
        message:
          "Application not found.",
      });
    }

    // ==================================================
    // CHECK DISTRICT ACCESS
    // ==================================================

    if (
      normalizeDistrict(
        application.district
      ) !== normalizedOfficerDistrict
    ) {
      return res.status(403).json({
        message:
          "You can verify applications only from your own district.",
      });
    }

    // ==================================================
    // FIND ASSOCIATED SCHEME
    // ==================================================

    const scheme =
      await HousingScheme.findById(
        application.schemeId
      );

    if (!scheme) {
      return res.status(404).json({
        message:
          "Housing scheme associated with this application was not found.",
      });
    }

    // ==================================================
    // APPLICATION STATUS CHECK
    // ==================================================
    //
    // Only unprocessed applications can be verified.
    //
    // SUBMITTED
    // UNDER_VERIFICATION
    //
    // ==================================================

    if (
      ![
        "SUBMITTED",
        "UNDER_VERIFICATION",
      ].includes(
        application.status
      )
    ) {
      return res.status(400).json({
        message:
          "This application has already been processed.",
      });
    }

    // ==================================================
    // CHECK ADMIN-DEFINED ELIGIBILITY
    // ==================================================
    //
    // Officer cannot modify the common scheme rules.
    //
    // Rules:
    //
    // eligibleIncomeCategories
    // maximumAnnualIncome
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
      Number(
        application.annualIncome
      ) <=
      Number(
        scheme.maximumAnnualIncome
      );

    // ==================================================
    // ELIGIBILITY VALIDATION
    // ==================================================

    if (status === "ELIGIBLE") {
      // ----------------------------------------------
      // INCOME CATEGORY
      // ----------------------------------------------

      if (!categoryAllowed) {
        return res.status(400).json({
          message:
            `Applicant income category (${applicantCategory}) ` +
            "is not eligible for this housing scheme.",
        });
      }

      // ----------------------------------------------
      // ANNUAL INCOME
      // ----------------------------------------------

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
    // CREATE / ACTIVATE WAITING LIST ENTRY
    // ==================================================
    //
    // IMPORTANT:
    //
    // This happens immediately after successful
    // eligibility verification.
    //
    // It does NOT require a district configuration.
    //
    // Ranking is based on:
    //
    //     schemeId + district
    //
    // ==================================================

    if (status === "ELIGIBLE") {
      // ----------------------------------------------
      // Check whether a waiting-list entry already
      // exists for this application.
      // ----------------------------------------------

      let waitingListEntry =
        await WaitingList.findOne({
          applicationId:
            application._id,
        });

      // ----------------------------------------------
      // Find the current highest active position
      // for this scheme + district.
      // ----------------------------------------------

      const lastWaitingListEntry =
        await WaitingList.findOne({
          schemeId:
            application.schemeId,
          district:
            application.district,
          status: "ACTIVE",
        })
          .sort({
            districtPosition: -1,
          });

      const nextPosition =
        lastWaitingListEntry
          ? Number(
              lastWaitingListEntry.districtPosition
            ) + 1
          : 1;

      // ----------------------------------------------
      // Existing waiting-list entry
      // ----------------------------------------------

      if (waitingListEntry) {
        waitingListEntry.applicantId =
          application.applicantId;

        waitingListEntry.applicationId =
          application._id;

        waitingListEntry.schemeId =
          application.schemeId;

        waitingListEntry.district =
          application.district;

        waitingListEntry.districtPosition =
          nextPosition;

        waitingListEntry.status =
          "ACTIVE";

        waitingListEntry.removedAt =
          null;

        waitingListEntry.removalReason =
          undefined;

        waitingListEntry.lastUpdated =
          new Date();

        await waitingListEntry.save();
      } else {
        // --------------------------------------------
        // Create new waiting-list entry
        // --------------------------------------------

        waitingListEntry =
          await WaitingList.create({
            applicantId:
              application.applicantId,

            applicationId:
              application._id,

            schemeId:
              application.schemeId,

            district:
              application.district,

            districtPosition:
              nextPosition,

            status: "ACTIVE",

            lastUpdated:
              new Date(),
          });
      }

      const rankedEntries =
        await recalculateWaitingList(
          application.schemeId,
          application.district
        );

      const rankedEntry = rankedEntries.find(
        (entry) =>
          entry.applicationId?._id?.toString() ===
            application._id.toString() ||
          entry.applicationId?.toString() ===
            application._id.toString()
      );

      // ==================================================
      // RESPONSE — ELIGIBLE + RANKED
      // ==================================================

      return res.status(200).json({
        message:
          "Application verified successfully and added to the district waiting list.",

        application,

        waitingList: rankedEntry || waitingListEntry,
      });
    }

    // ==================================================
    // REJECTED APPLICATION
    // ==================================================

    return res.status(200).json({
      message:
        "Application rejected successfully.",

      application,
    });
  } catch (error) {
    console.error(
      "Verify application error:",
      error
    );

    // ==================================================
    // DUPLICATE WAITING-LIST ENTRY
    // ==================================================

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A waiting-list entry already exists for this application.",
      });
    }

    // ==================================================
    // MONGOOSE VALIDATION
    // ==================================================

    if (
      error.name === "ValidationError"
    ) {
      return res.status(400).json({
        message:
          error.message ||
          "Invalid waiting-list data.",
      });
    }

    return res.status(500).json({
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