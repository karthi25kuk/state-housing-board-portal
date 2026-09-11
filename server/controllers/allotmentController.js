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
// Officer selects:
//
// 1. Waiting list entry
// 2. Officer's district configuration
// 3. House number
//
// Validation:
//
// - Waiting list is ACTIVE
// - Waiting list belongs to officer district
// - Application belongs to same waiting list
// - Application is ELIGIBLE
// - Applicant belongs to officer district
// - Applicant has NOT already been allotted
// - Applicant has no other active offer
// - Configuration belongs to this scheme
// - Configuration belongs to officer
// - Configuration belongs to officer district
// - Allotment date has arrived
// - Available unit exists
// - House number is not currently offered/allotted
//
// ======================================================

const createAllotment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    const {
      waitingListId,
      configurationId,
      houseNumber,
    } = req.body;

    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (
      !waitingListId ||
      !configurationId ||
      !houseNumber
    ) {
      return res.status(400).json({
        message:
          "Waiting list ID, configuration ID and house number are required.",
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

    const trimmedHouseNumber =
      String(houseNumber).trim();

    if (!trimmedHouseNumber) {
      return res.status(400).json({
        message:
          "House number cannot be empty.",
      });
    }

    // ==================================================
    // START TRANSACTION
    // ==================================================

    session.startTransaction();

    // ==================================================
    // FIND WAITING LIST
    // ==================================================

    const waitingList =
      await WaitingList.findById(
        waitingListId
      ).session(session);

    if (!waitingList) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Waiting list entry not found.",
      });
    }

    // ==================================================
    // WAITING LIST MUST BE ACTIVE
    // ==================================================

    if (
      waitingList.status !== "ACTIVE"
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "This applicant is no longer active in the district ranking.",
      });
    }

    // ==================================================
    // WAITING LIST DISTRICT CHECK
    // ==================================================

    if (
      normalize(waitingList.district) !==
      normalize(officerDistrict)
    ) {
      await session.abortTransaction();

      return res.status(403).json({
        message:
          "You cannot allot a house to another district.",
      });
    }

    // ==================================================
    // FIND APPLICATION
    // ==================================================

    const application =
      await Application.findById(
        waitingList.applicationId
      ).session(session);

    if (!application) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Application associated with this waiting list entry was not found.",
      });
    }

    // ==================================================
    // WAITING LIST / APPLICATION CONSISTENCY
    // ==================================================

    if (
      application._id.toString() !==
      waitingList.applicationId.toString()
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Waiting list and application records do not match.",
      });
    }

    // ==================================================
    // APPLICATION DISTRICT CHECK
    // ==================================================

    if (
      normalize(application.district) !==
      normalize(officerDistrict)
    ) {
      await session.abortTransaction();

      return res.status(403).json({
        message:
          "Application does not belong to your district.",
      });
    }

    // ==================================================
    // WAITING LIST SCHEME / APPLICATION SCHEME CHECK
    // ==================================================

    if (
      application.schemeId.toString() !==
      waitingList.schemeId.toString()
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Waiting list and application scheme do not match.",
      });
    }

    // ==================================================
    // APPLICATION MUST BE ELIGIBLE
    // ==================================================

    if (
      application.status !== "ELIGIBLE"
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Only eligible applications can receive allotment.",
      });
    }

    // ==================================================
    // FIND APPLICANT
    // ==================================================

    const applicant =
      await User.findById(
        application.applicantId
      ).session(session);

    if (!applicant) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Applicant not found.",
      });
    }

    // ==================================================
    // APPLICANT DISTRICT CHECK
    // ==================================================

    if (
      normalize(applicant.district) !==
      normalize(officerDistrict)
    ) {
      await session.abortTransaction();

      return res.status(403).json({
        message:
          "Applicant does not belong to your district.",
      });
    }

    // ==================================================
    // CHECK EXISTING HOUSE
    // ==================================================

    if (
      applicant.housingStatus === "ALLOTTED"
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "This applicant has already been allotted a house.",
      });
    }

    // ==================================================
    // CHECK OTHER ACTIVE ALLOTMENT
    // ==================================================
    //
    // OFFERED and ACCEPTED are active.
    //
    // REJECTED and CANCELLED are historical and do not
    // prevent a future allotment offer.
    //

    const existingAllotment =
      await Allotment.findOne({
        applicantId: applicant._id,
        status: {
          $in: [
            "OFFERED",
            "ACCEPTED",
          ],
        },
      }).session(session);

    if (existingAllotment) {
      await session.abortTransaction();

      return res.status(409).json({
        message:
          "This applicant already has an active allotment offer.",
      });
    }

    // ==================================================
    // FIND SCHEME
    // ==================================================

    const scheme =
      await HousingScheme.findById(
        waitingList.schemeId
      ).session(session);

    if (!scheme) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Housing scheme not found.",
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
    // CONFIGURATION / WAITING LIST DISTRICT CHECK
    // ==================================================

    if (
      normalize(configuration.district) !==
      normalize(waitingList.district)
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Configuration district does not match the waiting list district.",
      });
    }

    // ==================================================
    // CONFIGURATION / APPLICATION DISTRICT CHECK
    // ==================================================

    if (
      normalize(configuration.district) !==
      normalize(application.district)
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Configuration district does not match the application district.",
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
    // CHECK HOUSE NUMBER
    // ==================================================
    //
    // Only OFFERED and ACCEPTED houses are unavailable.
    //
    // REJECTED offers release the house and therefore
    // allow the house number to be reused.
    //

    const existingHouse =
      await Allotment.findOne({
        configurationId:
          configuration._id,

        houseNumber:
          trimmedHouseNumber,

        status: {
          $in: [
            "OFFERED",
            "ACCEPTED",
          ],
        },
      }).session(session);

    if (existingHouse) {
      await session.abortTransaction();

      return res.status(409).json({
        message:
          "This house number is already offered or allotted.",
      });
    }

    // ==================================================
    // CREATE ALLOTMENT
    // ==================================================

    const allotment =
      new Allotment({
        applicationId:
          application._id,

        applicantId:
          applicant._id,

        schemeId:
          scheme._id,

        configurationId:
          configuration._id,

        district:
          configuration.district,

        location:
          configuration.location,

        houseNumber:
          trimmedHouseNumber,

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
    // If applicant rejects:
    //   -> unit returned
    //   -> waiting list remains ACTIVE
    //
    // If applicant accepts:
    //   -> applicant becomes ALLOTTED
    //   -> all active waiting lists are removed
    //

    await session.commitTransaction();

    return res.status(201).json({
      message:
        "Allotment offer created successfully.",

      allotment,
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
      //
      // This handles:
      //
      // - current scheme
      // - other schemes
      // - other districts if historical data exists
      //
      // Once a house is accepted, applicant must not
      // participate in any other active waiting list.
      //

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
    //
    // Applicant remains eligible.
    //
    // Unit is returned.
    //
    // Waiting list remains ACTIVE.
    //

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
      //
      // Normally the waiting-list entry should already
      // exist because an allotment can only be created
      // from an ACTIVE waiting-list entry.
      //
      // If it is missing, recreate it safely.
      //

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