const WaitingList = require("../models/WaitingList");
const Application = require("../models/Application");
const HousingScheme = require("../models/HousingScheme");

// ======================================================
// GET MY WAITING LIST ENTRIES - APPLICANT
// ======================================================

const getMyWaitingLists = async (req, res) => {
  try {
    const applicantId = req.user.userId;

    const waitingLists = await WaitingList.find({
      applicantId,
    })
      .populate(
        "schemeId",
        "schemeName description eligibleIncomeCategories maximumAnnualIncome houseModel price location totalUnits availableUnits applicationStartDate applicationEndDate status"
      )
      .populate(
        "applicationId",
        "applicationNumber status submittedAt"
      )
      .sort({
        overallPosition: 1,
      });

    res.status(200).json({
      waitingLists,
    });
  } catch (error) {
    console.error(
      "Get my waiting lists error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching waiting list.",
    });
  }
};


// ======================================================
// GET WAITING LIST FOR OFFICER
// ======================================================
// Officer can only see waiting lists belonging to
// schemes assigned to that officer.
//
// Officer does NOT create waiting-list entries manually.

const getOfficerWaitingList = async (req, res) => {
  try {
    const officerId = req.user.userId;

    // ==================================================
    // FIND SCHEMES ASSIGNED TO OFFICER
    // ==================================================

    const schemes = await HousingScheme.find({
      assignedOfficer: officerId,
    }).select("_id");

    const schemeIds = schemes.map(
      (scheme) => scheme._id
    );

    // ==================================================
    // FIND WAITING LIST ENTRIES
    // ==================================================

    const waitingLists = await WaitingList.find({
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
        "applicationNumber status familyMembers annualIncome incomeCategory employmentStatus"
      )
      .populate(
        "schemeId",
        "schemeName description eligibleIncomeCategories maximumAnnualIncome houseModel price location totalUnits availableUnits applicationStartDate applicationEndDate status"
      )
      .sort({
        overallPosition: 1,
      });

    res.status(200).json({
      waitingLists,
    });
  } catch (error) {
    console.error(
      "Get officer waiting list error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching waiting list.",
    });
  }
};


// ======================================================
// GENERATE AUTOMATIC RANKING
// ======================================================
// This function is called AFTER the application period
// has closed.
//
// Only ELIGIBLE applications are ranked.
//
// The system automatically determines the ranking.
// Officer does NOT manually add applicants.
//
// Current ranking rule:
// 1. Higher family members first
// 2. Lower annual income next
// 3. Earlier application submission next
//
// This can be changed later if the project defines
// a different official priority rule.

const generateRanking = async (req, res) => {
  try {
    const officerId = req.user.userId;

    const { schemeId } = req.params;

    // ==================================================
    // FIND SCHEME
    // ==================================================

    const scheme = await HousingScheme.findOne({
      _id: schemeId,
      assignedOfficer: officerId,
    });

    if (!scheme) {
      return res.status(404).json({
        message:
          "Scheme not found or not assigned to you.",
      });
    }

    // ==================================================
    // APPLICATION PERIOD MUST BE CLOSED
    // ==================================================

    const now = new Date();

    if (
      now <=
      new Date(scheme.applicationEndDate)
    ) {
      return res.status(400).json({
        message:
          "Ranking can only be generated after the application period has closed.",
      });
    }

    // ==================================================
    // UPDATE SCHEME STATUS
    // ==================================================

    if (scheme.status === "OPEN") {
      scheme.status = "CLOSED";
      await scheme.save();
    }

    // ==================================================
    // FIND ELIGIBLE APPLICATIONS
    // ==================================================

    const applications =
      await Application.find({
        schemeId: scheme._id,
        status: "ELIGIBLE",
      }).sort({
        familyMembers: -1,
        annualIncome: 1,
        submittedAt: 1,
      });

    if (applications.length === 0) {
      return res.status(200).json({
        message:
          "No eligible applications were found for ranking.",
        waitingLists: [],
      });
    }

    // ==================================================
    // REMOVE OLD ACTIVE RANKINGS
    // ==================================================
    // This allows ranking to be regenerated safely
    // before the officer approves it.

    await WaitingList.deleteMany({
      schemeId: scheme._id,
      status: "ACTIVE",
    });

    // ==================================================
    // CREATE NEW RANKING
    // ==================================================

    const waitingListEntries = [];

    for (
      let index = 0;
      index < applications.length;
      index++
    ) {
      const application = applications[index];

      // Applicant district comes from application.
      // If unavailable, use scheme district.

      const applicantDistrict =
        application.district ||
        scheme.district;

      waitingListEntries.push({
        applicantId:
          application.applicantId,

        applicationId:
          application._id,

        schemeId:
          scheme._id,

        district:
          applicantDistrict,

        overallPosition:
          index + 1,

        districtPosition:
          0,

        status:
          "ACTIVE",

        lastUpdated:
          new Date(),
      });
    }

    // ==================================================
    // CALCULATE DISTRICT POSITIONS
    // ==================================================

    const districtCounters = {};

    for (
      const entry of waitingListEntries
    ) {
      const district =
        entry.district;

      if (
        !districtCounters[district]
      ) {
        districtCounters[district] = 1;
      } else {
        districtCounters[district]++;
      }

      entry.districtPosition =
        districtCounters[district];
    }

    // ==================================================
    // INSERT RANKING
    // ==================================================

    const waitingLists =
      await WaitingList.insertMany(
        waitingListEntries
      );

    // ==================================================
    // UPDATE APPLICATION STATUS
    // ==================================================
    // Eligible applications now become part of
    // the waiting-list/ranking process.

    await Application.updateMany(
      {
        _id: {
          $in: applications.map(
            (application) =>
              application._id
          ),
        },
      },
      {
        $set: {
          status: "WAITING_LIST",
        },
      }
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(201).json({
      message:
        "Waiting list ranking generated successfully.",

      totalRankedApplicants:
        waitingLists.length,

      waitingLists,
    });
  } catch (error) {
    console.error(
      "Generate ranking error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while generating ranking.",
    });
  }
};


// ======================================================
// APPROVE RANKING
// ======================================================
// Officer reviews the automatically generated ranking
// and approves it.
//
// Officer does NOT change individual positions.
//
// After approval, allotment generation can begin.

const approveRanking = async (req, res) => {
  try {
    const officerId = req.user.userId;

    const { schemeId } = req.params;

    // ==================================================
    // FIND SCHEME
    // ==================================================

    const scheme = await HousingScheme.findOne({
      _id: schemeId,
      assignedOfficer: officerId,
    });

    if (!scheme) {
      return res.status(404).json({
        message:
          "Scheme not found or not assigned to you.",
      });
    }

    // ==================================================
    // SCHEME MUST BE CLOSED
    // ==================================================

    if (scheme.status !== "CLOSED") {
      return res.status(400).json({
        message:
          "Ranking can only be approved after the scheme is closed.",
      });
    }

    // ==================================================
    // CHECK RANKING
    // ==================================================

    const waitingLists =
      await WaitingList.find({
        schemeId: scheme._id,
        status: "ACTIVE",
      }).sort({
        overallPosition: 1,
      });

    if (waitingLists.length === 0) {
      return res.status(400).json({
        message:
          "No ranking is available to approve.",
      });
    }

    // ==================================================
    // MARK RANKING AS APPROVED
    // ==================================================
    // We use the scheme field below.
    //
    // IMPORTANT:
    // Add these fields to HousingScheme.js:
    //
    // rankingGenerated: Boolean
    // rankingApproved: Boolean
    // rankingApprovedBy: ObjectId
    // rankingApprovedAt: Date

    scheme.rankingGenerated = true;

    scheme.rankingApproved = true;

    scheme.rankingApprovedBy =
      officerId;

    scheme.rankingApprovedAt =
      new Date();

    await scheme.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(200).json({
      message:
        "Waiting list ranking approved successfully.",

      rankingApproved: true,

      waitingLists,
    });
  } catch (error) {
    console.error(
      "Approve ranking error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while approving ranking.",
    });
  }
};


// ======================================================
// RECALCULATE WAITING LIST POSITIONS
// ======================================================
// Called after an applicant receives an allotment.
//
// All remaining ACTIVE candidates are moved upward.
//
// Example:
//
// Before:
// 1 Ravi   -> ALLOTTED
// 2 Kumar  -> ACTIVE
// 3 Arun   -> ACTIVE
//
// After:
// 1 Kumar
// 2 Arun

const recalculateWaitingList = async (
  schemeId
) => {
  const activeEntries =
    await WaitingList.find({
      schemeId,
      status: "ACTIVE",
    }).sort({
      overallPosition: 1,
    });

  const districtCounters = {};

  for (
    let index = 0;
    index < activeEntries.length;
    index++
  ) {
    const entry =
      activeEntries[index];

    const district =
      entry.district;

    if (
      !districtCounters[district]
    ) {
      districtCounters[district] = 1;
    } else {
      districtCounters[district]++;
    }

    entry.overallPosition =
      index + 1;

    entry.districtPosition =
      districtCounters[district];

    entry.lastUpdated =
      new Date();

    await entry.save();
  }

  return activeEntries;
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getMyWaitingLists,
  getOfficerWaitingList,
  generateRanking,
  approveRanking,
  recalculateWaitingList,
};