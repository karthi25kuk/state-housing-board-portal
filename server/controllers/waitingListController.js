const WaitingList = require("../models/WaitingList");
const Application = require("../models/Application");
const HousingScheme = require("../models/HousingScheme");

// ======================================================
// HELPER
// ======================================================

const normalizeDistrict = (district) => {
  return district?.trim().toLowerCase();
};

// ======================================================
// GET MY WAITING LISTS
// ======================================================
//
// Applicant sees only their own ACTIVE rankings.
//
// Ranking scope:
//
//     schemeId + district
//
// ======================================================

const getMyWaitingLists = async (req, res) => {
  try {
    const applicantId = req.user.userId;

    const waitingLists =
      await WaitingList.find({
        applicantId,
        status: "ACTIVE",
      })
        .populate(
          "schemeId",
          "schemeName description eligibleIncomeCategories maximumAnnualIncome houseModel price"
        )
        .populate(
          "applicationId",
          "applicationNumber status submittedAt familyMembers annualIncome incomeCategory"
        )
        .sort({
          districtPosition: 1,
          createdAt: 1,
        });

    return res.status(200).json({
      waitingLists,
    });
  } catch (error) {
    console.error(
      "Get my waiting lists error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching waiting list.",
    });
  }
};

// ======================================================
// GET OFFICER WAITING LIST
// ======================================================
//
// Officer sees ONLY rankings belonging to their district.
//
// IMPORTANT:
//
// Ranking does NOT require a housing configuration.
//
// Therefore an Officer can see:
//
// Scheme A + Erode
//
// even when:
//
// Scheme A has no Erode configuration yet.
//
// ======================================================

const getOfficerWaitingList = async (req, res) => {
  try {
    const officerDistrict = req.user.district;

    if (!officerDistrict?.trim()) {
      return res.status(400).json({
        message:
          "Officer district is not configured.",
      });
    }

    // ==================================================
    // FIND ACTIVE RANKINGS DIRECTLY BY DISTRICT
    // ==================================================
    //
    // DO NOT find schemes through configurations.
    //
    // Ranking exists independently of housing
    // configuration.
    //
    // ==================================================

    const waitingLists =
      await WaitingList.find({
        district: {
          $regex:
            `^${officerDistrict.trim()}$`,
          $options: "i",
        },

        status: "ACTIVE",
      })
        .populate(
          "applicantId",
          "name email phone district housingStatus"
        )
        .populate(
          "applicationId",
          "applicationNumber status familyMembers annualIncome incomeCategory employmentStatus occupation submittedAt"
        )
        .populate(
          "schemeId",
          "schemeName description eligibleIncomeCategories maximumAnnualIncome houseModel price"
        )
        .sort({
          schemeId: 1,
          districtPosition: 1,
        });

    return res.status(200).json({
      district: officerDistrict,
      waitingLists,
    });
  } catch (error) {
    console.error(
      "Get officer waiting list error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching waiting list.",
    });
  }
};

// ======================================================
// GENERATE / RECALCULATE DISTRICT RANKING
// ======================================================
//
// Ranking scope:
//
//     schemeId + district
//
// IMPORTANT:
//
// Housing configuration is NOT required.
//
// This means:
//
// Admin creates Scheme
//       ↓
// Applicants apply
//       ↓
// Officers verify
//       ↓
// ELIGIBLE applications enter WaitingList
//       ↓
// Ranking can be generated
//       ↓
// Officer later configures housing
//       ↓
// Allotment follows ranking
//
// Ranking criteria:
//
// 1. Family members DESC
// 2. Annual income ASC
// 3. Submitted date ASC
// 4. _id ASC
//
// ======================================================

const generateRanking = async (req, res) => {
  try {
    const officerDistrict = req.user.district;
    const { schemeId } = req.params;

    // ==================================================
    // VALIDATE OFFICER DISTRICT
    // ==================================================

    if (!officerDistrict?.trim()) {
      return res.status(400).json({
        message:
          "Officer district is not configured.",
      });
    }

    const normalizedOfficerDistrict =
      normalizeDistrict(officerDistrict);

    // ==================================================
    // FIND SCHEME
    // ==================================================

    const scheme =
      await HousingScheme.findById(
        schemeId
      );

    if (!scheme) {
      return res.status(404).json({
        message:
          "Housing scheme not found.",
      });
    }

    // ==================================================
    // FIND ELIGIBLE APPLICATIONS
    // ==================================================
    //
    // IMPORTANT:
    //
    // No configuration check here.
    //
    // Ranking is based only on:
    //
    // schemeId + district + ELIGIBLE
    //
    // ==================================================

    const applications =
      await Application.find({
        schemeId: scheme._id,

        district: {
          $regex:
            `^${officerDistrict.trim()}$`,
          $options: "i",
        },

        status: "ELIGIBLE",
      }).sort({
        familyMembers: -1,
        annualIncome: 1,
        submittedAt: 1,
        _id: 1,
      });

    // ==================================================
    // GET CURRENT ACTIVE WAITING-LIST ENTRIES
    // ==================================================

    const existingEntries =
      await WaitingList.find({
        schemeId: scheme._id,

        district: {
          $regex:
            `^${officerDistrict.trim()}$`,
          $options: "i",
        },

        status: "ACTIVE",
      });

    // ==================================================
    // MAP EXISTING ENTRIES BY APPLICATION
    // ==================================================

    const existingByApplication =
      new Map();

    existingEntries.forEach(
      (entry) => {
        existingByApplication.set(
          entry.applicationId.toString(),
          entry
        );
      }
    );

    const eligibleApplicationIds =
      new Set(
        applications.map(
          (application) =>
            application._id.toString()
        )
      );

    // ==================================================
    // REMOVE ACTIVE ENTRIES THAT ARE NO LONGER ELIGIBLE
    // ==================================================
    //
    // Examples:
    //
    // Application withdrawn
    // Application rejected
    // Application otherwise removed
    //
    // Historical record remains as REMOVED.
    //
    // ==================================================

    for (
      const entry of existingEntries
    ) {
      if (
        !eligibleApplicationIds.has(
          entry.applicationId.toString()
        )
      ) {
        entry.status = "REMOVED";
        entry.removedAt = new Date();
        entry.removalReason =
          "APPLICATION_REJECTED";
        entry.lastUpdated = new Date();

        await entry.save();
      }
    }

    // ==================================================
    // CREATE / UPDATE RANKING
    // ==================================================
    //
    // IMPORTANT:
    //
    // We UPDATE existing records instead of deleting
    // and recreating them.
    //
    // This prevents conflicts with the unique index:
    //
    // applicantId + schemeId + district
    //
    // ==================================================

    const rankedEntries = [];

    for (
      let index = 0;
      index < applications.length;
      index++
    ) {
      const application =
        applications[index];

      let entry =
        existingByApplication.get(
          application._id.toString()
        );

      // ----------------------------------------------
      // Existing active entry
      // ----------------------------------------------

      if (entry) {
        entry.applicantId =
          application.applicantId;

        entry.applicationId =
          application._id;

        entry.schemeId =
          scheme._id;

        entry.district =
          application.district.trim();

        entry.districtPosition =
          index + 1;

        entry.status =
          "ACTIVE";

        entry.removedAt =
          null;

        entry.removalReason =
          undefined;

        entry.lastUpdated =
          new Date();

        await entry.save();

        rankedEntries.push(entry);

        continue;
      }

      // ----------------------------------------------
      // New entry
      // ----------------------------------------------
      //
      // This can happen when a newly eligible
      // application does not yet have a waiting-list
      // record.
      //
      // ----------------------------------------------

      entry =
        await WaitingList.create({
          applicantId:
            application.applicantId,

          applicationId:
            application._id,

          schemeId:
            scheme._id,

          district:
            application.district.trim(),

          districtPosition:
            index + 1,

          status:
            "ACTIVE",

          removedAt:
            null,

          lastUpdated:
            new Date(),
        });

      rankedEntries.push(entry);
    }

    // ==================================================
    // NO ELIGIBLE APPLICATIONS
    // ==================================================

    if (
      applications.length === 0
    ) {
      return res.status(200).json({
        message:
          "No eligible applications were found for this district.",

        schemeId:
          scheme._id,

        schemeName:
          scheme.schemeName,

        district:
          officerDistrict,

        totalRankedApplicants: 0,

        waitingLists: [],
      });
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      message:
        `District ranking generated successfully for ${officerDistrict}.`,

      schemeId:
        scheme._id,

      schemeName:
        scheme.schemeName,

      district:
        officerDistrict,

      totalRankedApplicants:
        rankedEntries.length,

      waitingLists:
        rankedEntries,
    });
  } catch (error) {
    console.error(
      "Generate ranking error:",
      error
    );

    // ==================================================
    // DUPLICATE KEY
    // ==================================================

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        message:
          "A duplicate waiting-list entry was detected. Please regenerate the ranking.",
      });
    }

    // ==================================================
    // VALIDATION ERROR
    // ==================================================

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        message:
          error.message ||
          "Invalid waiting-list data.",
      });
    }

    return res.status(500).json({
      message:
        "Server error while generating district ranking.",
    });
  }
};

// ======================================================
// APPROVE / VERIFY DISTRICT RANKING
// ======================================================
//
// There is no rankingApproved field in HousingScheme.
//
// Therefore this endpoint does not modify the scheme.
//
// It verifies that an ACTIVE ranking exists.
//
// IMPORTANT:
//
// Configuration is NOT required to generate or verify
// ranking.
//
// Configuration becomes relevant when allotment begins.
// ======================================================

const approveRanking = async (req, res) => {
  try {
    const officerDistrict = req.user.district;
    const { schemeId } = req.params;

    if (!officerDistrict?.trim()) {
      return res.status(400).json({
        message:
          "Officer district is not configured.",
      });
    }

    // ==================================================
    // FIND SCHEME
    // ==================================================

    const scheme =
      await HousingScheme.findById(
        schemeId
      );

    if (!scheme) {
      return res.status(404).json({
        message:
          "Housing scheme not found.",
      });
    }

    // ==================================================
    // FIND ACTIVE RANKING
    // ==================================================

    const waitingLists =
      await WaitingList.find({
        schemeId:
          scheme._id,

        district: {
          $regex:
            `^${officerDistrict.trim()}$`,
          $options: "i",
        },

        status: "ACTIVE",
      })
        .populate(
          "applicantId",
          "name email phone district housingStatus"
        )
        .populate(
          "applicationId",
          "applicationNumber status familyMembers annualIncome incomeCategory employmentStatus occupation submittedAt"
        )
        .sort({
          districtPosition: 1,
        });

    if (
      waitingLists.length === 0
    ) {
      return res.status(400).json({
        message:
          "No active district ranking is available.",
      });
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      message:
        `District ranking verified successfully for ${officerDistrict}.`,

      schemeId:
        scheme._id,

      schemeName:
        scheme.schemeName,

      district:
        officerDistrict,

      rankingApproved:
        true,

      totalRankedApplicants:
        waitingLists.length,

      waitingLists,
    });
  } catch (error) {
    console.error(
      "Approve ranking error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while approving district ranking.",
    });
  }
};

// ======================================================
// RECALCULATE DISTRICT RANKING
// ======================================================
//
// Used after an applicant is removed.
//
// Ranking:
//
// Before:
//
// 1 Kumar
// 2 Ravi
// 3 Priya
// 4 Arun
//
// Kumar removed:
//
// 1 Ravi
// 2 Priya
// 3 Arun
//
// ======================================================

const recalculateWaitingList = async (
  schemeId,
  district
) => {
  const activeEntries =
    await WaitingList.find({
      schemeId,

      district: {
        $regex:
          `^${district.trim()}$`,
        $options: "i",
      },

      status: "ACTIVE",
    })
      .populate(
        "applicationId"
      )
      .sort({
        createdAt: 1,
      });

  activeEntries.sort((left, right) => {
    const leftApplication = left.applicationId;
    const rightApplication = right.applicationId;

    return (
      Number(rightApplication?.familyMembers || 0) -
        Number(leftApplication?.familyMembers || 0) ||
      Number(leftApplication?.annualIncome || 0) -
        Number(rightApplication?.annualIncome || 0) ||
      new Date(
        leftApplication?.submittedAt ||
          leftApplication?.createdAt ||
          left.createdAt
      ) -
        new Date(
          rightApplication?.submittedAt ||
            rightApplication?.createdAt ||
            right.createdAt
        ) ||
      left.applicationId._id.toString().localeCompare(
        right.applicationId._id.toString()
      )
    );
  });

  // ==================================================
  // ONLY ELIGIBLE APPLICATIONS SHOULD REMAIN RANKED
  // ==================================================

  const eligibleEntries =
    activeEntries.filter(
      (entry) =>
        entry.applicationId &&
        entry.applicationId.status ===
          "ELIGIBLE"
    );

  const now = new Date();

  // ==================================================
  // REMOVE INVALID ACTIVE ENTRIES
  // ==================================================

  for (
    const entry of activeEntries
  ) {
    const isEligible =
      eligibleEntries.some(
        (eligibleEntry) =>
          eligibleEntry._id.toString() ===
          entry._id.toString()
      );

    if (!isEligible) {
      entry.status =
        "REMOVED";

      entry.removedAt =
        now;

      entry.removalReason =
        "APPLICATION_REJECTED";

      entry.lastUpdated =
        now;

      await entry.save();
    }
  }

  // ==================================================
  // REASSIGN POSITIONS
  // ==================================================

  for (
    let index = 0;
    index < eligibleEntries.length;
    index++
  ) {
    const entry =
      eligibleEntries[index];

    entry.districtPosition =
      index + 1;

    entry.status =
      "ACTIVE";

    entry.lastUpdated =
      now;

    await entry.save();
  }

  return eligibleEntries;
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