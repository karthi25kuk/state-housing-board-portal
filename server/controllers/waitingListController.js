const WaitingList = require("../models/WaitingList");
const Application = require("../models/Application");
const HousingScheme = require("../models/HousingScheme");

// ==========================================
// GET MY WAITING LIST ENTRIES
// ==========================================

const getMyWaitingLists = async (req, res) => {
  try {
    const applicantId = req.user.userId;

    const waitingLists = await WaitingList.find({
      applicantId,
    })
      .populate(
        "schemeId",
        "schemeName district location houseModel price"
      )
      .populate(
        "applicationId",
        "applicationNumber status submittedAt"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      waitingLists,
    });
  } catch (error) {
    console.error("Get waiting lists error:", error);

    res.status(500).json({
      message: "Server error while fetching waiting list.",
    });
  }
};

// ==========================================
// GET WAITING LIST FOR OFFICER
// ==========================================

const getOfficerWaitingList = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    // Get schemes created by this officer
    const schemes = await HousingScheme.find({
      createdBy: officerId,
      district: officerDistrict,
    }).select("_id");

    const schemeIds = schemes.map((scheme) => scheme._id);

    const waitingLists = await WaitingList.find({
      schemeId: { $in: schemeIds },
    })
      .populate(
        "applicantId",
        "name email phone district"
      )
      .populate(
        "applicationId",
        "applicationNumber status familyMembers annualIncome incomeCategory employmentStatus"
      )
      .populate(
        "schemeId",
        "schemeName district location houseModel price"
      )
      .sort({
        overallPosition: 1,
      });

    res.status(200).json({
      waitingLists,
    });
  } catch (error) {
    console.error("Get officer waiting list error:", error);

    res.status(500).json({
      message: "Server error while fetching waiting list.",
    });
  }
};

// ==========================================
// ADD APPLICATION TO WAITING LIST
// ==========================================

const addToWaitingList = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    const { applicationId } = req.params;

    // ------------------------------------------
    // Get application
    // ------------------------------------------

    const application = await Application.findById(
      applicationId
    ).populate("schemeId");

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // ------------------------------------------
    // Check officer owns the scheme
    // ------------------------------------------

    const scheme = await HousingScheme.findOne({
      _id: application.schemeId._id,
      createdBy: officerId,
      district: officerDistrict,
    });

    if (!scheme) {
      return res.status(403).json({
        message:
          "You do not have permission to process this application.",
      });
    }

    // ------------------------------------------
    // Application must be ELIGIBLE
    // ------------------------------------------

    if (application.status !== "ELIGIBLE") {
      return res.status(400).json({
        message:
          "Only eligible applications can be added to the waiting list.",
      });
    }

    // ------------------------------------------
    // Check duplicate waiting-list entry
    // ------------------------------------------

    const existingEntry = await WaitingList.findOne({
      applicationId: application._id,
    });

    if (existingEntry) {
      return res.status(409).json({
        message:
          "This application is already in the waiting list.",
      });
    }

    // ------------------------------------------
    // Get next overall position
    // ------------------------------------------

    const lastOverallEntry = await WaitingList.findOne({
      schemeId: scheme._id,
    }).sort({
      overallPosition: -1,
    });

    const overallPosition = lastOverallEntry
      ? lastOverallEntry.overallPosition + 1
      : 1;

    // ------------------------------------------
    // Get applicant district
    // ------------------------------------------

    const applicant = await require("../models/User").findById(
      application.applicantId
    );

    if (!applicant) {
      return res.status(404).json({
        message: "Applicant not found.",
      });
    }

    const applicantDistrict =
      applicant.district || scheme.district;

    // ------------------------------------------
    // Get next district position
    // ------------------------------------------

    const lastDistrictEntry = await WaitingList.findOne({
      schemeId: scheme._id,
      district: applicantDistrict,
    }).sort({
      districtPosition: -1,
    });

    const districtPosition = lastDistrictEntry
      ? lastDistrictEntry.districtPosition + 1
      : 1;

    // ------------------------------------------
    // Create waiting-list entry
    // ------------------------------------------

    const waitingList = await WaitingList.create({
      applicantId: application.applicantId,

      applicationId: application._id,

      schemeId: scheme._id,

      district: applicantDistrict,

      overallPosition,

      districtPosition,

      status: "ACTIVE",
    });

    // ------------------------------------------
    // Update application status
    // ------------------------------------------

    application.status = "WAITING_LIST";

    await application.save();

    // ------------------------------------------
    // Response
    // ------------------------------------------

    res.status(201).json({
      message:
        "Application successfully added to the waiting list.",

      waitingList,
    });
  } catch (error) {
    console.error("Add waiting list error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This application is already in the waiting list.",
      });
    }

    res.status(500).json({
      message:
        "Server error while adding application to waiting list.",
    });
  }
};

module.exports = {
  getMyWaitingLists,
  getOfficerWaitingList,
  addToWaitingList,
};