const Application = require("../models/Application");
const HousingScheme = require("../models/HousingScheme");

// ==========================================
// GET APPLICATIONS FOR OFFICER
// ==========================================

const getOfficerApplications = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    // Find schemes belonging to this officer
    const schemes = await HousingScheme.find({
      createdBy: officerId,
      district: officerDistrict,
    }).select("_id");

    const schemeIds = schemes.map((scheme) => scheme._id);

    // Find applications submitted for those schemes
    const applications = await Application.find({
      schemeId: { $in: schemeIds },
    })
      .populate(
        "applicantId",
        "name email phone district"
      )
      .populate(
        "schemeId",
        "schemeName district location houseModel price"
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

// ==========================================
// GET SINGLE APPLICATION
// ==========================================

const getOfficerApplicationById = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    const { applicationId } = req.params;

    // Find officer's schemes
    const schemes = await HousingScheme.find({
      createdBy: officerId,
      district: officerDistrict,
    }).select("_id");

    const schemeIds = schemes.map(
      (scheme) => scheme._id
    );

    // Find application only if it belongs
    // to one of officer's schemes
    const application = await Application.findOne({
      _id: applicationId,
      schemeId: { $in: schemeIds },
    })
      .populate(
        "applicantId",
        "name email phone district"
      )
      .populate(
        "schemeId",
        "schemeName district location houseModel price"
      );

    if (!application) {
      return res.status(404).json({
        message:
          "Application not found or access denied.",
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

// ==========================================
// VERIFY APPLICATION
// ==========================================

const verifyApplication = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    const { applicationId } = req.params;

    const {
      status,
      verificationRemarks,
    } = req.body;

    // ------------------------------------------
    // Validate status
    // ------------------------------------------

    if (!["ELIGIBLE", "INELIGIBLE"].includes(status)) {
      return res.status(400).json({
        message:
          "Invalid verification status.",
      });
    }

    // ------------------------------------------
    // Find officer's schemes
    // ------------------------------------------

    const schemes = await HousingScheme.find({
      createdBy: officerId,
      district: officerDistrict,
    }).select("_id");

    const schemeIds = schemes.map(
      (scheme) => scheme._id
    );

    // ------------------------------------------
    // Find application
    // ------------------------------------------

    const application = await Application.findOne({
      _id: applicationId,
      schemeId: { $in: schemeIds },
    });

    if (!application) {
      return res.status(404).json({
        message:
          "Application not found or access denied.",
      });
    }

    // ------------------------------------------
    // Prevent re-verification
    // ------------------------------------------

    if (
      application.status === "ELIGIBLE" ||
      application.status === "INELIGIBLE"
    ) {
      return res.status(400).json({
        message:
          "This application has already been verified.",
      });
    }

    // ------------------------------------------
    // Update application
    // ------------------------------------------

    application.status = status;

    application.verifiedBy = officerId;

    application.verifiedAt = new Date();

    application.verificationRemarks =
      verificationRemarks || "";

    await application.save();

    res.status(200).json({
      message:
        status === "ELIGIBLE"
          ? "Application verified successfully. Applicant is eligible."
          : "Application verified. Applicant is ineligible.",

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

module.exports = {
  getOfficerApplications,
  getOfficerApplicationById,
  verifyApplication,
};