const Allotment = require("../models/Allotment");
const WaitingList = require("../models/WaitingList");
const Application = require("../models/Application");
const HousingScheme = require("../models/HousingScheme");
const User = require("../models/User");

// ==========================================
// CREATE ALLOTMENT OFFER
// ==========================================

const createAllotment = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    const {
      waitingListId,
      houseNumber,
    } = req.body;

    // ------------------------------------------
    // Validate input
    // ------------------------------------------

    if (!waitingListId || !houseNumber) {
      return res.status(400).json({
        message:
          "Waiting list ID and house number are required.",
      });
    }

    // ------------------------------------------
    // Get waiting-list entry
    // ------------------------------------------

    const waitingList = await WaitingList.findById(
      waitingListId
    );

    if (!waitingList) {
      return res.status(404).json({
        message: "Waiting list entry not found.",
      });
    }

    // ------------------------------------------
    // Waiting list must be ACTIVE
    // ------------------------------------------

    if (waitingList.status !== "ACTIVE") {
      return res.status(400).json({
        message:
          "This waiting list entry is not available for allotment.",
      });
    }

    // ------------------------------------------
    // Get scheme
    // ------------------------------------------

    const scheme = await HousingScheme.findOne({
      _id: waitingList.schemeId,
      createdBy: officerId,
      district: officerDistrict,
    });

    if (!scheme) {
      return res.status(403).json({
        message:
          "You do not have permission to allot a house for this scheme.",
      });
    }

    // ------------------------------------------
    // Check available houses
    // ------------------------------------------

    if (scheme.availableUnits <= 0) {
      return res.status(400).json({
        message:
          "No houses are currently available in this scheme.",
      });
    }

    // ------------------------------------------
    // Get application
    // ------------------------------------------

    const application = await Application.findById(
      waitingList.applicationId
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // ------------------------------------------
    // Application must be WAITING_LIST
    // ------------------------------------------

    if (application.status !== "WAITING_LIST") {
      return res.status(400).json({
        message:
          "Only waiting-list applications can receive allotment offers.",
      });
    }

    // ------------------------------------------
    // Check existing allotment
    // ------------------------------------------

    const existingAllotment =
      await Allotment.findOne({
        applicationId: application._id,
      });

    if (existingAllotment) {
      return res.status(409).json({
        message:
          "An allotment already exists for this application.",
      });
    }

    // ------------------------------------------
    // Get applicant
    // ------------------------------------------

    const applicant = await User.findById(
      application.applicantId
    );

    if (!applicant) {
      return res.status(404).json({
        message: "Applicant not found.",
      });
    }

    // ------------------------------------------
    // Create allotment
    // ------------------------------------------

    const allotment = await Allotment.create({
      applicationId: application._id,

      applicantId: application.applicantId,

      schemeId: scheme._id,

      waitingListId: waitingList._id,

      houseNumber,

      houseModel: scheme.houseModel,

      price: scheme.price,

      status: "OFFERED",

      offeredAt: new Date(),

      allottedBy: officerId,
    });

    // ------------------------------------------
    // Update waiting list
    // ------------------------------------------

    waitingList.status = "ALLOTMENT_OFFERED";

    await waitingList.save();

    // ------------------------------------------
    // Update application
    // ------------------------------------------

    application.status = "ALLOTMENT_OFFERED";

    await application.save();

    // ------------------------------------------
    // Reduce available units
    // ------------------------------------------

    scheme.availableUnits =
      scheme.availableUnits - 1;

    await scheme.save();

    // ------------------------------------------
    // Response
    // ------------------------------------------

    res.status(201).json({
      message:
        "Allotment offer created successfully.",

      allotment,
    });
  } catch (error) {
    console.error(
      "Create allotment error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "An allotment already exists for this application or waiting-list entry.",
      });
    }

    res.status(500).json({
      message:
        "Server error while creating allotment.",
    });
  }
};

// ==========================================
// GET OFFICER ALLOTMENTS
// ==========================================

const getOfficerAllotments = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    const schemes = await HousingScheme.find({
      createdBy: officerId,
      district: officerDistrict,
    }).select("_id");

    const schemeIds = schemes.map(
      (scheme) => scheme._id
    );

    const allotments = await Allotment.find({
      schemeId: {
        $in: schemeIds,
      },
    })
      .populate(
        "applicantId",
        "name email phone district"
      )
      .populate(
        "applicationId",
        "applicationNumber status familyMembers annualIncome incomeCategory"
      )
      .populate(
        "schemeId",
        "schemeName district location houseModel price"
      )
      .populate(
        "waitingListId",
        "overallPosition districtPosition status"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      allotments,
    });
  } catch (error) {
    console.error(
      "Get officer allotments error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching allotments.",
    });
  }
};

// ==========================================
// GET APPLICANT ALLOTMENTS
// ==========================================

const getMyAllotments = async (req, res) => {
  try {
    const applicantId = req.user.userId;

    const allotments = await Allotment.find({
      applicantId,
    })
      .populate(
        "schemeId",
        "schemeName district location houseModel price"
      )
      .populate(
        "applicationId",
        "applicationNumber status"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      allotments,
    });
  } catch (error) {
    console.error(
      "Get my allotments error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching allotments.",
    });
  }
};

// ==========================================
// APPLICANT ACCEPT / REJECT ALLOTMENT
// ==========================================

const respondToAllotment = async (req, res) => {
  try {
    const applicantId = req.user.userId;
    const { allotmentId } = req.params;
    const { decision } = req.body;

    // ------------------------------------------
    // Validate decision
    // ------------------------------------------

    if (!decision || !["ACCEPT", "REJECT"].includes(decision)) {
      return res.status(400).json({
        message: "Decision must be ACCEPT or REJECT.",
      });
    }

    // ------------------------------------------
    // Find allotment belonging to applicant
    // ------------------------------------------

    const allotment = await Allotment.findOne({
      _id: allotmentId,
      applicantId,
    });

    if (!allotment) {
      return res.status(404).json({
        message: "Allotment offer not found.",
      });
    }

    // ------------------------------------------
    // Offer must still be pending
    // ------------------------------------------

    if (allotment.status !== "OFFERED") {
      return res.status(400).json({
        message:
          "This allotment offer has already been responded to.",
      });
    }

    // ------------------------------------------
    // Get related records
    // ------------------------------------------

    const application = await Application.findById(
      allotment.applicationId
    );

    const waitingList = await WaitingList.findById(
      allotment.waitingListId
    );

    const scheme = await HousingScheme.findById(
      allotment.schemeId
    );

    const applicant = await User.findById(
      applicantId
    );

    if (!application || !waitingList || !scheme || !applicant) {
      return res.status(404).json({
        message:
          "Related allotment records could not be found.",
      });
    }

    // ==========================================
    // ACCEPT OFFER
    // ==========================================

    if (decision === "ACCEPT") {
      // Allotment
      allotment.status = "ACCEPTED";
      allotment.respondedAt = new Date();

      // Application
      application.status = "ALLOTTED";

      // Waiting List
      waitingList.status = "ALLOTTED";

      // Applicant
      applicant.housingStatus = "ALLOTTED";

      // Save changes
      await allotment.save();
      await application.save();
      await waitingList.save();
      await applicant.save();

      return res.status(200).json({
        message: "Allotment accepted successfully.",
        allotment,
      });
    }

    // ==========================================
    // REJECT OFFER
    // ==========================================

    if (decision === "REJECT") {
      // Allotment
      allotment.status = "REJECTED";
      allotment.respondedAt = new Date();

      // Application goes back to waiting list
      application.status = "WAITING_LIST";

      // Waiting list becomes active
      waitingList.status = "ACTIVE";

      // Save allotment/application/waiting list
      await allotment.save();
      await application.save();
      await waitingList.save();

      // Return house to available units
      scheme.availableUnits += 1;

      await scheme.save();

      return res.status(200).json({
        message: "Allotment offer rejected successfully.",
        allotment,
      });
    }
  } catch (error) {
    console.error(
      "Respond to allotment error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while responding to allotment offer.",
    });
  }
};


module.exports = {
  createAllotment,
  getOfficerAllotments,
  getMyAllotments,
  respondToAllotment,
};