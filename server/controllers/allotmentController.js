const mongoose = require("mongoose");

const Allotment = require("../models/Allotment");
const WaitingList = require("../models/WaitingList");
const Application = require("../models/Application");
const HousingScheme = require("../models/HousingScheme");
const User = require("../models/User");

// ======================================================
// HELPER
// ======================================================

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();


// ======================================================
// CREATE ALLOTMENT OFFER
// ======================================================
//
// Officer selects ONLY:
//
//     configurationId
//
// Backend automatically selects:
//
//     ACTIVE waiting-list applicant
//     with the highest district ranking
//
// The backend also automatically generates the house number.
//
// Workflow:
//
// Officer clicks "Do Allotment"
//        ↓
// configurationId
//        ↓
// Find configuration
//        ↓
// Verify allotment date
//        ↓
// Find highest-ranked eligible applicant
//        ↓
// Create OFFERED allotment
//        ↓
// Reserve one unit
//
// ======================================================

const createAllotment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    const {
      configurationId,
    } = req.body;

    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (!configurationId) {
      return res.status(400).json({
        message:
          "Configuration ID is required.",
      });
    }

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
    // START TRANSACTION
    // ==================================================

    session.startTransaction();

    // ==================================================
    // FIND SCHEME FROM CONFIGURATION
    // ==================================================
    //
    // The configurationId belongs to a HousingScheme
    // subdocument, so first find the scheme containing
    // the officer's configuration.
    //
    // ==================================================

    const scheme =
      await HousingScheme.findOne({
        configurations: {
          $elemMatch: {
            _id: configurationId,
            officer: officerId,
          },
        },
      }).session(session);

    if (!scheme) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Housing scheme or officer configuration not found.",
      });
    }

    // ==================================================
    // FIND CONFIGURATION
    // ==================================================

    const configuration =
      scheme.configurations.id(
        configurationId
      );

    if (!configuration) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Housing configuration not found.",
      });
    }

    // ==================================================
    // CONFIGURATION OFFICER CHECK
    // ==================================================

    if (
      !configuration.officer ||
      configuration.officer.toString() !==
        officerId.toString()
    ) {
      await session.abortTransaction();

      return res.status(403).json({
        message:
          "This configuration is not assigned to you.",
      });
    }

    // ==================================================
    // CONFIGURATION DISTRICT CHECK
    // ==================================================

    if (
      normalize(configuration.district) !==
      normalize(officerDistrict)
    ) {
      await session.abortTransaction();

      return res.status(403).json({
        message:
          "This configuration belongs to another district.",
      });
    }

    // ==================================================
    // CHECK ALLOTMENT DATE
    // ==================================================

    const currentDate = new Date();

    if (
      !configuration.allotmentDate
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Allotment date is not configured for this district.",
      });
    }

    if (
      new Date(configuration.allotmentDate) >
      currentDate
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          `Allotment date has not arrived. Allotment can begin on ${new Date(
            configuration.allotmentDate
          ).toLocaleString()}.`,
      });
    }

    // ==================================================
    // CHECK AVAILABLE UNITS
    // ==================================================

    if (
      configuration.availableUnits <= 0
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "No houses are currently available in this configuration.",
      });
    }

    // ==================================================
    // FIND HIGHEST-RANKED ACTIVE APPLICANT
    // ==================================================
    //
    // Ranking is already generated by the waiting-list
    // module.
    //
    // We DO NOT calculate ranking here.
    //
    // The first eligible ACTIVE waiting-list entry is:
    //
    //     districtPosition ASC
    //
    // ==================================================

    const waitingLists =
      await WaitingList.find({
        schemeId: scheme._id,

        district: configuration.district,

        status: "ACTIVE",
      })
        .sort({
          districtPosition: 1,
        })
        .session(session);

    if (!waitingLists.length) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "No active eligible applicants are currently available in the district waiting list.",
      });
    }

    // ==================================================
    // FIND FIRST APPLICANT WHO CAN RECEIVE AN OFFER
    // ==================================================
    //
    // We check applicants in ranking order.
    //
    // Applicants who already have:
    //
    //     OFFERED
    //     ACCEPTED
    //
    // are skipped.
    //
    // This prevents the same applicant from receiving
    // another active offer.
    //
    // ==================================================

    let selectedWaitingList = null;
    let selectedApplication = null;
    let selectedApplicant = null;

    for (const entry of waitingLists) {
      // ----------------------------------------------
      // Find application
      // ----------------------------------------------

      const application =
        await Application.findById(
          entry.applicationId
        ).session(session);

      if (!application) {
        continue;
      }

      // ----------------------------------------------
      // Application must still be eligible
      // ----------------------------------------------

      if (
        application.status !== "ELIGIBLE"
      ) {
        continue;
      }

      // ----------------------------------------------
      // Verify scheme
      // ----------------------------------------------

      if (
        application.schemeId.toString() !==
        scheme._id.toString()
      ) {
        continue;
      }

      // ----------------------------------------------
      // Verify district
      // ----------------------------------------------

      if (
        normalize(application.district) !==
        normalize(configuration.district)
      ) {
        continue;
      }

      // ----------------------------------------------
      // Find applicant
      // ----------------------------------------------

      const applicant =
        await User.findById(
          application.applicantId
        ).session(session);

      if (!applicant) {
        continue;
      }

      // ----------------------------------------------
      // Verify applicant district
      // ----------------------------------------------

      if (
        normalize(applicant.district) !==
        normalize(officerDistrict)
      ) {
        continue;
      }

      // ----------------------------------------------
      // Applicant already allotted
      // ----------------------------------------------

      if (
        applicant.housingStatus ===
        "ALLOTTED"
      ) {
        continue;
      }

      // ----------------------------------------------
      // Check existing active allotment
      // ----------------------------------------------

      const existingAllotment =
        await Allotment.findOne({
          applicantId:
            applicant._id,

          status: {
            $in: [
              "OFFERED",
              "ACCEPTED",
            ],
          },
        }).session(session);

      if (existingAllotment) {
        continue;
      }

      // ----------------------------------------------
      // Applicant is valid
      // ----------------------------------------------

      selectedWaitingList = entry;
      selectedApplication = application;
      selectedApplicant = applicant;

      break;
    }

    // ==================================================
    // NO ELIGIBLE APPLICANT FOUND
    // ==================================================

    if (
      !selectedWaitingList ||
      !selectedApplication ||
      !selectedApplicant
    ) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "No eligible ranked applicant is currently available for allotment.",
      });
    }

    // ==================================================
    // GENERATE HOUSE NUMBER
    // ==================================================
    //
    // House numbers are generated independently for
    // each configuration.
    //
    // Example:
    //
    // Configuration:
    // Thiruparankundram
    //
    // HOUSE-001
    // HOUSE-002
    // HOUSE-003
    //
    // Only OFFERED and ACCEPTED houses are considered
    // occupied.
    //
    // ==================================================

    let houseNumber = null;

    for (
      let unitNumber = 1;
      unitNumber <= configuration.totalUnits;
      unitNumber++
    ) {
      const candidateHouseNumber =
        `HOUSE-${String(unitNumber).padStart(
          3,
          "0"
        )}`;

      const existingHouse =
        await Allotment.findOne({
          configurationId:
            configuration._id,

          houseNumber:
            candidateHouseNumber,

          status: {
            $in: [
              "OFFERED",
              "ACCEPTED",
            ],
          },
        }).session(session);

      if (!existingHouse) {
        houseNumber =
          candidateHouseNumber;

        break;
      }
    }

    // ==================================================
    // NO HOUSE NUMBER AVAILABLE
    // ==================================================

    if (!houseNumber) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "No physical house number is available in this configuration.",
      });
    }

    // ==================================================
    // CREATE ALLOTMENT
    // ==================================================

    const allotment =
      new Allotment({
        applicationId:
          selectedApplication._id,

        applicantId:
          selectedApplicant._id,

        schemeId:
          scheme._id,

        configurationId:
          configuration._id,

        district:
          configuration.district,

        location:
          configuration.location,

        houseNumber:
          houseNumber,

        houseModel:
          scheme.houseModel,

        price:
          scheme.price,

        status:
          "OFFERED",

        offeredAt:
          new Date(),

        respondedAt:
          null,

        remarks:
          "",

        allottedBy:
          officerId,
      });

    await allotment.save({
      session,
    });

    // ==================================================
    // RESERVE ONE UNIT
    // ==================================================
    //
    // The unit remains reserved while the offer is
    // OFFERED.
    //
    // If applicant accepts:
    //     unit remains unavailable.
    //
    // If applicant rejects:
    //     unit is restored.
    //
    // ==================================================

    configuration.availableUnits -= 1;

    await scheme.save({
      session,
    });

    // ==================================================
    // WAITING LIST REMAINS ACTIVE
    // ==================================================
    //
    // DO NOT remove the applicant here.
    //
    // Accept:
    //     waiting-list entry becomes REMOVED.
    //
    // Reject:
    //     waiting-list entry remains ACTIVE.
    //
    // ==================================================

    await session.commitTransaction();

    return res.status(201).json({
      message:
        "Allotment offer created successfully.",

      allotment,

      applicant: {
        _id:
          selectedApplicant._id,

        name:
          selectedApplicant.name,

        applicationNumber:
          selectedApplication.applicationNumber,

        districtPosition:
          selectedWaitingList.districtPosition,
      },

      configuration: {
        _id:
          configuration._id,

        district:
          configuration.district,

        location:
          configuration.location,

        availableUnits:
          configuration.availableUnits,
      },
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Create allotment error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while creating allotment.",
    });
  } finally {
    await session.endSession();
  }
};


// ======================================================
// GET OFFICER ALLOTMENTS
// ======================================================
//
// Officer can see allotments belonging to:
//
//     His district
//     +
//     His own configurations
//
// ======================================================

const getOfficerAllotments = async (
  req,
  res
) => {
  try {
    const officerId =
      req.user.userId;

    const officerDistrict =
      req.user.district;

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
    // FIND OFFICER'S CONFIGURATIONS
    // ==================================================

    const schemes =
      await HousingScheme.find({
        configurations: {
          $elemMatch: {
            officer: officerId,
            district: officerDistrict,
          },
        },
      }).select("_id");

    const schemeIds =
      schemes.map(
        (scheme) =>
          scheme._id
      );

    // ==================================================
    // GET ALLOTMENTS
    // ==================================================

    const allotments =
      await Allotment.find({
        schemeId: {
          $in: schemeIds,
        },

        district:
          officerDistrict,
      })
        .populate(
          "applicantId",
          "name email phone district housingStatus"
        )
        .populate(
          "applicationId",
          "applicationNumber status familyMembers annualIncome incomeCategory employmentStatus district"
        )
        .populate(
          "schemeId",
          "schemeName description houseModel price"
        )
        .populate(
          "allottedBy",
          "name email district"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      allotments,
    });
  } catch (error) {
    console.error(
      "Get officer allotments error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching allotments.",
    });
  }
};


// ======================================================
// GET MY ALLOTMENTS
// ======================================================

const getMyAllotments = async (
  req,
  res
) => {
  try {
    const applicantId =
      req.user.userId;

    const allotments =
      await Allotment.find({
        applicantId,
      })
        .populate(
          "schemeId",
          "schemeName description houseModel price"
        )
        .populate(
          "applicationId",
          "applicationNumber status district"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      allotments,
    });
  } catch (error) {
    console.error(
      "Get my allotments error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching allotments.",
    });
  }
};


// ======================================================
// RESPOND TO ALLOTMENT
// ======================================================
//
// ACCEPT
//   -> Allotment = ACCEPTED
//   -> Applicant = ALLOTTED
//   -> All active waiting lists = REMOVED
//
// REJECT
//   -> Allotment = REJECTED
//   -> Unit returned
//   -> Applicant remains NOT_ALLOTTED
//   -> Application remains ELIGIBLE
//   -> Waiting list remains ACTIVE
//
// ======================================================

const respondToAllotment = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const applicantId =
      req.user.userId;

    const { allotmentId } =
      req.params;

    const {
      decision,
      remarks,
    } = req.body;

    // ==================================================
    // VALIDATE DECISION
    // ==================================================

    if (
      !["ACCEPT", "REJECT"].includes(
        decision
      )
    ) {
      return res.status(400).json({
        message:
          "Decision must be ACCEPT or REJECT.",
      });
    }

    session.startTransaction();

    // ==================================================
    // FIND OFFER
    // ==================================================

    const allotment =
      await Allotment.findOne({
        _id: allotmentId,
        applicantId,
      }).session(session);

    if (!allotment) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Allotment offer not found.",
      });
    }

    // ==================================================
    // OFFER MUST BE PENDING
    // ==================================================

    if (
      allotment.status !== "OFFERED"
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "This allotment offer has already been responded to.",
      });
    }

    // ==================================================
    // FIND APPLICATION
    // ==================================================

    const application =
      await Application.findById(
        allotment.applicationId
      ).session(session);

    // ==================================================
    // FIND SCHEME
    // ==================================================

    const scheme =
      await HousingScheme.findById(
        allotment.schemeId
      ).session(session);

    // ==================================================
    // FIND APPLICANT
    // ==================================================

    const applicant =
      await User.findById(
        applicantId
      ).session(session);

    if (
      !application ||
      !scheme ||
      !applicant
    ) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Related allotment records could not be found.",
      });
    }

    // ==================================================
    // VERIFY APPLICATION / APPLICANT CONSISTENCY
    // ==================================================

    if (
      application.applicantId.toString() !==
      applicant._id.toString()
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Allotment applicant and application do not match.",
      });
    }

    // ==================================================
    // ACCEPT
    // ==================================================

    if (
      decision === "ACCEPT"
    ) {
      // ----------------------------------------------
      // Applicant must not already have another house
      // ----------------------------------------------

      if (
        applicant.housingStatus ===
        "ALLOTTED"
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          message:
            "Applicant has already been allotted a house.",
        });
      }

      // ----------------------------------------------
      // Update allotment
      // ----------------------------------------------

      allotment.status =
        "ACCEPTED";

      allotment.respondedAt =
        new Date();

      allotment.remarks =
        typeof remarks === "string"
          ? remarks.trim()
          : "";

      // ----------------------------------------------
      // Update applicant
      // ----------------------------------------------

      applicant.housingStatus =
        "ALLOTTED";

      // ----------------------------------------------
      // Keep application ELIGIBLE
      // ----------------------------------------------

      application.status =
        "ELIGIBLE";

      // ----------------------------------------------
      // Save records
      // ----------------------------------------------

      await allotment.save({
        session,
      });

      await application.save({
        session,
      });

      await applicant.save({
        session,
      });

      // ----------------------------------------------
      // REMOVE APPLICANT FROM ALL ACTIVE RANKINGS
      // ----------------------------------------------

      await WaitingList.updateMany(
        {
          applicantId,
          status: "ACTIVE",
        },
        {
          $set: {
            status:
              "REMOVED",

            removedAt:
              new Date(),

            removalReason:
              "ALLOTMENT_ACCEPTED",

            lastUpdated:
              new Date(),
          },
        },
        {
          session,
        }
      );

      await session.commitTransaction();

      return res.status(200).json({
        message:
          "Allotment accepted successfully. Applicant has been allotted the house.",

        allotment,
      });
    }

    // ==================================================
    // REJECT
    // ==================================================

    allotment.status =
      "REJECTED";

    allotment.respondedAt =
      new Date();

    allotment.remarks =
      typeof remarks === "string"
        ? remarks.trim()
        : "";

    application.status =
      "ELIGIBLE";

    applicant.housingStatus =
      "NOT_ALLOTTED";

    // ==================================================
    // FIND CONFIGURATION
    // ==================================================

    const configuration =
      scheme.configurations.id(
        allotment.configurationId
      );

    if (!configuration) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Housing configuration associated with this allotment was not found.",
      });
    }

    // ==================================================
    // RETURN RESERVED UNIT
    // ==================================================

    if (
      configuration.availableUnits >=
      configuration.totalUnits
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Configuration unit count is already at maximum capacity.",
      });
    }

    configuration.availableUnits += 1;

    // ==================================================
    // RESTORE WAITING LIST
    // ==================================================

    let waitingList =
      await WaitingList.findOne({
        applicationId:
          allotment.applicationId,
      }).session(session);

    if (waitingList) {
      waitingList.status =
        "ACTIVE";

      waitingList.removedAt =
        null;

      waitingList.removalReason =
        null;

      waitingList.lastUpdated =
        new Date();

      await waitingList.save({
        session,
      });
    } else {
      // ------------------------------------------------
      // Safety fallback
      // ------------------------------------------------

      const existingActiveCount =
        await WaitingList.countDocuments({
          schemeId:
            allotment.schemeId,

          district:
            allotment.district,

          status:
            "ACTIVE",
        }).session(session);

      waitingList =
        await WaitingList.create(
          [
            {
              applicantId:
                applicant._id,

              applicationId:
                application._id,

              schemeId:
                scheme._id,

              district:
                allotment.district,

              districtPosition:
                existingActiveCount + 1,

              status:
                "ACTIVE",

              removedAt:
                null,

              removalReason:
                null,

              lastUpdated:
                new Date(),
            },
          ],
          {
            session,
          }
        );

      waitingList =
        waitingList[0];
    }

    // ==================================================
    // SAVE
    // ==================================================

    await allotment.save({
      session,
    });

    await application.save({
      session,
    });

    await applicant.save({
      session,
    });

    await scheme.save({
      session,
    });

    await session.commitTransaction();

    return res.status(200).json({
      message:
        "Allotment rejected successfully. The house has been returned to available units and the applicant remains active in the waiting list.",

      allotment,
      waitingList,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error(
      "Respond to allotment error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while responding to allotment.",
    });
  } finally {
    await session.endSession();
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createAllotment,
  getOfficerAllotments,
  getMyAllotments,
  respondToAllotment,
};