
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
// BUILD DISTRICT RANKING
// ======================================================
//
// IMPORTANT:
//
// Application is the SOURCE OF TRUTH for ranking.
//
// Ranking scope:
//
//      schemeId + district
//
// Only applications with:
//
//      status = ELIGIBLE
//
// are ranked.
//
// Ranking criteria:
//
// 1. Family members DESC
// 2. Annual income ASC
// 3. Submitted date ASC
// 4. Application _id ASC
//
// Housing configuration is NOT required.
//
// ======================================================

const buildDistrictRanking = async (
  schemeId,
  district
) => {
  const normalizedDistrict =
    normalizeDistrict(district);

  if (!normalizedDistrict) {
    return [];
  }

  // ==================================================
  // FIND ALL ELIGIBLE APPLICATIONS
  // ==================================================
  //
  // Application is the authoritative source.
  //
  // Configuration is intentionally NOT checked.
  //

  const applications =
    await Application.find({
      schemeId,

      district: {
        $regex:
          `^${district.trim()}$`,
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
  // FIND EXISTING ACTIVE WAITING-LIST ENTRIES
  // ==================================================

  const existingEntries =
    await WaitingList.find({
      schemeId,

      district: {
        $regex:
          `^${district.trim()}$`,
        $options: "i",
      },

      status: "ACTIVE",
    });

  // ==================================================
  // MAP EXISTING ENTRIES BY APPLICATION
  // ==================================================

  const existingByApplication =
    new Map();

  existingEntries.forEach((entry) => {
    existingByApplication.set(
      entry.applicationId.toString(),
      entry
    );
  });

  // ==================================================
  // TRACK ELIGIBLE APPLICATION IDS
  // ==================================================

  const eligibleApplicationIds =
    new Set(
      applications.map(
        (application) =>
          application._id.toString()
      )
    );

  const now = new Date();

  // ==================================================
  // REMOVE ACTIVE ENTRIES THAT ARE NO LONGER ELIGIBLE
  // ==================================================
  //
  // Examples:
  //
  // Application rejected
  // Application withdrawn
  // Application otherwise no longer eligible
  //
  // Historical record remains as REMOVED.
  //

  for (const entry of existingEntries) {
    if (
      !eligibleApplicationIds.has(
        entry.applicationId.toString()
      )
    ) {
      entry.status = "REMOVED";
      entry.removedAt = now;
      entry.removalReason =
        "APPLICATION_REJECTED";
      entry.lastUpdated = now;

      await entry.save();
    }
  }

  // ==================================================
  // CREATE / UPDATE WAITING-LIST ENTRIES
  // ==================================================
  //
  // The ranking position comes directly from the
  // sorted eligible applications.
  //

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

    // ==================================================
    // EXISTING WAITING-LIST ENTRY
    // ==================================================

    if (entry) {
      entry.applicantId =
        application.applicantId;

      entry.applicationId =
        application._id;

      entry.schemeId =
        schemeId;

      entry.district =
        application.district.trim();

      entry.districtPosition =
        index + 1;

      entry.status =
        "ACTIVE";

      entry.removedAt =
        null;

      entry.removalReason =
        null;

      entry.lastUpdated =
        now;

      await entry.save();

      rankedEntries.push(entry);

      continue;
    }

    // ==================================================
    // NEW WAITING-LIST ENTRY
    // ==================================================
    //
    // This is important when an application becomes
    // ELIGIBLE but has no WaitingList document yet.
    //

    entry =
      await WaitingList.create({
        applicantId:
          application.applicantId,

        applicationId:
          application._id,

        schemeId,

        district:
          application.district.trim(),

        districtPosition:
          index + 1,

        status:
          "ACTIVE",

        removedAt:
          null,

        removalReason:
          null,

        lastUpdated:
          now,
      });

    rankedEntries.push(entry);
  }

  return rankedEntries;
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
    const applicantId =
      req.user.userId;

    const waitingLists =
      await WaitingList.find({
        applicantId,

        status:
          "ACTIVE",
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

const getOfficerWaitingList = async (
  req,
  res
) => {
  try {
    const officerDistrict =
      req.user.district;

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

    const waitingLists =
      await WaitingList.find({
        district: {
          $regex:
            `^${officerDistrict.trim()}$`,
          $options: "i",
        },

        status:
          "ACTIVE",
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
      district:
        officerDistrict,

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
// Flow:
//
// Admin creates Scheme
//       ↓
// Applicant applies
//       ↓
// Officer verifies
//       ↓
// Application = ELIGIBLE
//       ↓
// WaitingList entry
//       ↓
// District ranking
//       ↓
// Officer later configures housing
//       ↓
// Allotment follows ranking
//
// ======================================================

const generateRanking = async (
  req,
  res
) => {
  try {
    const officerDistrict =
      req.user.district;

    const { schemeId } =
      req.params;

    // ==================================================
    // VALIDATE OFFICER DISTRICT
    // ==================================================

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
    // BUILD AUTHORITATIVE RANKING
    // ==================================================
    //
    // This function:
    //
    // 1. Finds all eligible applications
    // 2. Sorts them
    // 3. Creates missing entries
    // 4. Updates existing entries
    // 5. Removes obsolete entries
    // 6. Assigns positions
    //
    // Configuration is NOT required.
    //

    const rankedEntries =
      await buildDistrictRanking(
        scheme._id,
        officerDistrict
      );

    // ==================================================
    // NO ELIGIBLE APPLICATIONS
    // ==================================================

    if (
      rankedEntries.length === 0
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

        totalRankedApplicants:
          0,

        waitingLists:
          [],
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
//
// ======================================================

const approveRanking = async (
  req,
  res
) => {
  try {
    const officerDistrict =
      req.user.district;

    const { schemeId } =
      req.params;

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
    // ENSURE RANKING IS CURRENT
    // ==================================================
    //
    // Ranking is regenerated from eligible applications
    // before verification.
    //
    // This prevents stale positions.
    //

    const rankedEntries =
      await buildDistrictRanking(
        scheme._id,
        officerDistrict
      );

    if (
      rankedEntries.length === 0
    ) {
      return res.status(400).json({
        message:
          "No active district ranking is available.",
      });
    }

    // ==================================================
    // FETCH POPULATED RANKING FOR RESPONSE
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

        status:
          "ACTIVE",
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
// Used whenever ranking needs to be refreshed.
//
// IMPORTANT:
//
// This function is also called immediately after an
// application becomes ELIGIBLE.
//
// Therefore it MUST derive ranking from eligible
// APPLICATIONS, not merely from existing WaitingList
// documents.
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
  // ==================================================
  // BUILD AUTHORITATIVE RANKING
  // ==================================================

  const rankedEntries =
    await buildDistrictRanking(
      schemeId,
      district
    );

  // ==================================================
  // RETURN POPULATED ENTRIES
  // ==================================================
  //
  // The caller may need applicationId information to
  // identify the newly ranked applicant.
  //

  if (
    rankedEntries.length === 0
  ) {
    return [];
  }

  const rankedEntryIds =
    rankedEntries.map(
      (entry) => entry._id
    );

  const populatedEntries =
    await WaitingList.find({
      _id: {
        $in:
          rankedEntryIds,
      },
    })
      .populate(
        "applicantId",
        "name email phone district housingStatus"
      )
      .populate(
        "applicationId",
        "applicationNumber status submittedAt familyMembers annualIncome incomeCategory employmentStatus occupation"
      )
      .populate(
        "schemeId",
        "schemeName description eligibleIncomeCategories maximumAnnualIncome houseModel price"
      )
      .sort({
        districtPosition: 1,
      });

  return populatedEntries;
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

