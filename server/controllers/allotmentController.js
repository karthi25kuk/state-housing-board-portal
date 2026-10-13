const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

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

const calculatePriorityScore = (application, scheme) => {
  const incomeLimit = Number(scheme.maximumAnnualIncome);
  const annualIncome = Number(application.annualIncome);

  const incomeScore =
    incomeLimit > 0
      ? Math.max(0, Math.min(40, 40 * (1 - annualIncome / incomeLimit)))
      : 0;

  const familyMembers = Number(application.familyMembers);

  let familyScore = 5;

  if (familyMembers >= 7) {
    familyScore = 30;
  } else if (familyMembers >= 5) {
    familyScore = 25;
  } else if (familyMembers >= 3) {
    familyScore = 15;
  }

  const housingScores = {
    RENTING: 30,
    OWN_HOUSE: 0,
    INADEQUATE_HOUSING: 30,
  };

  const housingScore = housingScores[application.housingStatus] ?? 0;

  const totalScore = incomeScore + familyScore + housingScore;

  return {
    incomeScore: Number(incomeScore.toFixed(2)),
    familyScore,
    housingScore,
    totalScore: Number(totalScore.toFixed(2)),
  };
};

const getEligibleApplicantsForAllotment = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;
    const { configurationId } = req.params;

    if (!mongoose.isValidObjectId(configurationId)) {
      return res.status(400).json({
        message: "Invalid configuration ID.",
      });
    }

    if (!officerDistrict?.trim()) {
      return res.status(400).json({
        message: "Officer district is not configured.",
      });
    }

    const scheme = await HousingScheme.findOne({
      configurations: {
        $elemMatch: {
          _id: configurationId,
          officer: officerId,
        },
      },
    });

    if (!scheme) {
      return res.status(404).json({
        message: "Housing scheme or officer configuration not found.",
      });
    }

    const configuration = scheme.configurations.id(configurationId);

    if (
      !configuration ||
      normalize(configuration.district) !== normalize(officerDistrict)
    ) {
      return res.status(403).json({
        message: "This configuration does not belong to your district.",
      });
    }

    const waitingEntries = await WaitingList.find({
      schemeId: scheme._id,
      district: configuration.district,
      status: "ACTIVE",
    }).sort({ districtPosition: 1 });

    const applicants = [];

    for (const entry of waitingEntries) {
      const application = await Application.findOne({
        _id: entry.applicationId,
        applicantId: entry.applicantId,
        schemeId: scheme._id,
        status: "ELIGIBLE",
      });

      if (
        !application ||
        normalize(application.district) !== normalize(configuration.district)
      ) {
        continue;
      }

      const applicant = await User.findById(entry.applicantId);

      if (
        !applicant ||
        normalize(applicant.district) !== normalize(officerDistrict) ||
        applicant.housingStatus === "ALLOTTED"
      ) {
        continue;
      }

      const existingAllotment = await Allotment.findOne({
        applicantId: applicant._id,
        status: { $in: ["OFFERED", "ACCEPTED"] },
      });

      if (existingAllotment) {
        continue;
      }

      applicants.push({
        applicant: {
          _id: applicant._id,
          name: applicant.name,
          email: applicant.email,
          phone: applicant.phone,
          district: applicant.district,
        },
        application: {
          _id: application._id,
          applicationNumber: application.applicationNumber,
          annualIncome: application.annualIncome,
          familyMembers: application.familyMembers,
          incomeCategory: application.incomeCategory,
          employmentStatus: application.employmentStatus,
          occupation: application.occupation,
          housingStatus: application.housingStatus,
          submittedAt: application.submittedAt,
        },
        districtPosition: entry.districtPosition,
        priorityScore: calculatePriorityScore(application, scheme),
      });
    }

    applicants.sort(
      (a, b) =>
        b.priorityScore.totalScore - a.priorityScore.totalScore ||
        a.districtPosition - b.districtPosition,
    );

    return res.status(200).json({
      scheme: {
        _id: scheme._id,
        schemeName: scheme.schemeName,
      },
      configuration: {
        _id: configuration._id,
        district: configuration.district,
        location: configuration.location,
        availableUnits: configuration.availableUnits,
      },
      applicants,
    });
  } catch (error) {
    console.error("Get eligible allotment applicants error:", error);

    return res.status(500).json({
      message: "Server error while fetching eligible applicants.",
    });
  }
};

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

    const { configurationId, applicantId } = req.body;

    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (!configurationId) {
      return res.status(400).json({
        message: "Configuration ID is required.",
      });
    }

    if (!mongoose.isValidObjectId(applicantId)) {
      return res.status(400).json({
        message: "A valid applicant ID is required.",
      });
    }

    if (!officerDistrict || !officerDistrict.trim()) {
      return res.status(400).json({
        message: "Officer district is not configured.",
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

    const scheme = await HousingScheme.findOne({
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
        message: "Housing scheme or officer configuration not found.",
      });
    }

    // ==================================================
    // FIND CONFIGURATION
    // ==================================================

    const configuration = scheme.configurations.id(configurationId);

    if (!configuration) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Housing configuration not found.",
      });
    }

    // ==================================================
    // CONFIGURATION OFFICER CHECK
    // ==================================================

    if (
      !configuration.officer ||
      configuration.officer.toString() !== officerId.toString()
    ) {
      await session.abortTransaction();

      return res.status(403).json({
        message: "This configuration is not assigned to you.",
      });
    }

    // ==================================================
    // CONFIGURATION DISTRICT CHECK
    // ==================================================

    if (normalize(configuration.district) !== normalize(officerDistrict)) {
      await session.abortTransaction();

      return res.status(403).json({
        message: "This configuration belongs to another district.",
      });
    }

    // ==================================================
    // CHECK ALLOTMENT DATE
    // ==================================================

    const currentDate = new Date();

    if (!configuration.allotmentDate) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Allotment date is not configured for this district.",
      });
    }

    if (new Date(configuration.allotmentDate) > currentDate) {
      await session.abortTransaction();

      return res.status(400).json({
        message: `Allotment date has not arrived. Allotment can begin on ${new Date(
          configuration.allotmentDate,
        ).toLocaleString()}.`,
      });
    }

    // ==================================================
    // CHECK AVAILABLE UNITS
    // ==================================================

    if (configuration.availableUnits <= 0) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "No houses are currently available in this configuration.",
      });
    }

    const selectedWaitingList = await WaitingList.findOne({
      applicantId,
      schemeId: scheme._id,
      district: configuration.district,
      status: "ACTIVE",
    }).session(session);

    if (!selectedWaitingList) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "The selected applicant does not have an active waiting-list entry for this scheme and district.",
      });
    }

    const selectedApplication = await Application.findOne({
      _id: selectedWaitingList.applicationId,
      applicantId,
      schemeId: scheme._id,
      status: "ELIGIBLE",
    }).session(session);

    if (
      !selectedApplication ||
      normalize(selectedApplication.district) !==
        normalize(configuration.district)
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "The selected applicant's application is not eligible for this configuration.",
      });
    }

    const selectedApplicant = await User.findById(applicantId).session(session);

    if (
      !selectedApplicant ||
      normalize(selectedApplicant.district) !== normalize(officerDistrict)
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "The selected applicant does not belong to your district.",
      });
    }

    if (selectedApplicant.housingStatus === "ALLOTTED") {
      await session.abortTransaction();

      return res.status(400).json({
        message: "The selected applicant has already been allotted a house.",
      });
    }

    const existingAllotment = await Allotment.findOne({
      applicantId: selectedApplicant._id,
      status: { $in: ["OFFERED", "ACCEPTED"] },
    }).session(session);

    if (existingAllotment) {
      await session.abortTransaction();

      return res.status(409).json({
        message:
          "The selected applicant already has an active offer or accepted allotment.",
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
      const candidateHouseNumber = `HOUSE-${String(unitNumber).padStart(
        3,
        "0",
      )}`;

      const existingHouse = await Allotment.findOne({
        configurationId: configuration._id,

        houseNumber: candidateHouseNumber,

        status: {
          $in: ["OFFERED", "ACCEPTED"],
        },
      }).session(session);

      if (!existingHouse) {
        houseNumber = candidateHouseNumber;

        break;
      }
    }

    // ==================================================
    // NO HOUSE NUMBER AVAILABLE
    // ==================================================

    if (!houseNumber) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "No physical house number is available in this configuration.",
      });
    }

    // ==================================================
    // CREATE ALLOTMENT
    // ==================================================

    const allotment = new Allotment({
      applicationId: selectedApplication._id,

      applicantId: selectedApplicant._id,

      schemeId: scheme._id,

      configurationId: configuration._id,

      district: configuration.district,

      location: configuration.location,

      houseNumber: houseNumber,

      houseModel: scheme.houseModel,

      price: scheme.price,

      status: "OFFERED",

      offeredAt: new Date(),

      respondedAt: null,

      remarks: "",

      allottedBy: officerId,
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
      message: "Allotment offer created successfully.",

      allotment,

      applicant: {
        _id: selectedApplicant._id,

        name: selectedApplicant.name,

        applicationNumber: selectedApplication.applicationNumber,

        districtPosition: selectedWaitingList.districtPosition,
      },

      configuration: {
        _id: configuration._id,

        district: configuration.district,

        location: configuration.location,

        availableUnits: configuration.availableUnits,
      },
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Create allotment error:", error);

    return res.status(500).json({
      message: "Server error while creating allotment.",
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

const getOfficerAllotments = async (req, res) => {
  try {
    const officerId = req.user.userId;

    const officerDistrict = req.user.district;

    if (!officerDistrict || !officerDistrict.trim()) {
      return res.status(400).json({
        message: "Officer district is not configured.",
      });
    }

    // ==================================================
    // FIND OFFICER'S CONFIGURATIONS
    // ==================================================

    const schemes = await HousingScheme.find({
      configurations: {
        $elemMatch: {
          officer: officerId,
          district: officerDistrict,
        },
      },
    }).select("_id");

    const schemeIds = schemes.map((scheme) => scheme._id);

    // ==================================================
    // GET ALLOTMENTS
    // ==================================================

    const allotments = await Allotment.find({
      schemeId: {
        $in: schemeIds,
      },

      district: officerDistrict,
    })
      .populate("applicantId", "name email phone district housingStatus")
      .populate(
        "applicationId",
        "applicationNumber status familyMembers annualIncome incomeCategory employmentStatus district",
      )
      .populate("schemeId", "schemeName description houseModel price")
      .populate("allottedBy", "name email district")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      allotments,
    });
  } catch (error) {
    console.error("Get officer allotments error:", error);

    return res.status(500).json({
      message: "Server error while fetching allotments.",
    });
  }
};

// ======================================================
// GET MY ALLOTMENTS
// ======================================================

const getMyAllotments = async (req, res) => {
  try {
    const applicantId = req.user.userId;

    const allotments = await Allotment.find({
      applicantId,
    })
      .populate("schemeId", "schemeName description houseModel price")
      .populate("applicationId", "applicationNumber status district")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      allotments,
    });
  } catch (error) {
    console.error("Get my allotments error:", error);

    return res.status(500).json({
      message: "Server error while fetching allotments.",
    });
  }
};

const downloadAllotmentCopy = async (req, res) => {
  try {
    const { allotmentId } = req.params;
    const applicantId = req.user.userId;

    if (!mongoose.isValidObjectId(allotmentId)) {
      return res.status(400).json({
        message: "Invalid allotment ID.",
      });
    }

    // Only the applicant who owns this allotment can download it.
    const allotment = await Allotment.findOne({
      _id: allotmentId,
      applicantId,
      status: { $in: ["OFFERED", "ACCEPTED"] },
    })
      .populate("applicantId", "name email phone")
      .populate("applicationId", "applicationNumber")
      .populate("schemeId", "schemeName houseModel price")
      .populate("allottedBy", "name");

    if (!allotment) {
      return res.status(404).json({
        message:
          "Allotment not found, access denied, or the allotment is no longer active.",
      });
    }

    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 55,
        bottom: 55,
        left: 55,
        right: 55,
      },
      info: {
        Title: "House Allotment Order",
        Author: "State Housing Board",
      },
    });

    const filename = `Allotment_Order_${allotment.houseNumber || allotment._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, no-store");

    doc.on("error", (error) => {
      console.error("Allotment PDF generation error:", error);

      if (!res.headersSent) {
        res.status(500).end("Unable to generate allotment PDF.");
      } else {
        res.destroy(error);
      }
    });

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const left = 55;
    const right = pageWidth - 55;
    const contentWidth = right - left;

    const formatDate = (date) => {
      if (!date) return "Not available";

      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

    const formatPrice = (price) => {
      const amount = Number(price);

      if (!Number.isFinite(amount)) {
        return "Not available";
      }

      return `Rs. ${amount.toLocaleString("en-IN")}`;
    };

    const addField = (label, value) => {
      doc.font("Helvetica-Bold").fontSize(10).text(label, left, doc.y, {
        width: 155,
        continued: true,
      });

      doc.font("Helvetica").text(String(value ?? "Not available"), {
        width: contentWidth - 155,
      });

      doc.moveDown(0.65);
    };

    // Header
    doc.font("Helvetica-Bold").fontSize(19).text("STATE HOUSING BOARD", {
      align: "center",
    });

    doc.moveDown(0.4);

    doc.font("Helvetica").fontSize(10).text("HOUSE ALLOTMENT ORDER", {
      align: "center",
    });

    doc.moveDown(0.5);
    doc.moveTo(left, doc.y).lineTo(right, doc.y).stroke();

    doc.moveDown(1.5);

    // Order information
    doc.font("Helvetica-Bold").fontSize(12).text("ALLOTMENT DETAILS");
    doc.moveDown(1);

    addField("Allotment Reference:", String(allotment._id));
    addField("Application Number:", allotment.applicationId?.applicationNumber);
    addField("Allotment Status:", allotment.status);
    addField("Offer Date:", formatDate(allotment.offeredAt));
    addField("Response Date:", formatDate(allotment.respondedAt));

    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(12).text("APPLICANT DETAILS");
    doc.moveDown(1);

    addField("Applicant Name:", allotment.applicantId?.name);
    addField("Email:", allotment.applicantId?.email);
    addField("Phone:", allotment.applicantId?.phone);

    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(12).text("HOUSE DETAILS");
    doc.moveDown(1);

    addField("Housing Scheme:", allotment.schemeId?.schemeName);
    addField("District:", allotment.district);
    addField("Location:", allotment.location);
    addField("House Number:", allotment.houseNumber);
    addField(
      "House Model:",
      allotment.houseModel || allotment.schemeId?.houseModel,
    );
    addField("Allotment Price:", formatPrice(allotment.price));

    doc.moveDown(1);

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(
        "Please retain this document for your records. " +
          "The allotment is subject to the applicable housing scheme " +
          "rules and the terms communicated by the Housing Board.",
        {
          width: contentWidth,
          align: "justify",
          lineGap: 3,
        },
      );
    
    doc.moveDown(2);

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(
        "Reach Out the Housing Board within 10 days after allotment offer received." +
          " If you have any questions or concerns regarding your allotment, " +
          "please contact the Housing Board at the earliest."+
          " Failure to respond within the stipulated time may result in the forfeiture of your allotment." +
          "Address: State Housing Board, District Collectorate.",
        {
          width: contentWidth,
          align: "justify",
          lineGap: 3,
        },
      );

    doc.moveDown(3);

    doc.font("Helvetica-Bold").fontSize(10).text("Authorized Officer", {
      align: "right",
    });

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(allotment.allottedBy?.name || "State Housing Board", {
        align: "right",
      });

    doc.moveDown(2);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("gray")
      .text(
        "System-generated document. Verify its validity with the Housing Board.",
        {
          align: "center",
        },
      );

    doc.end();
  } catch (error) {
    console.error("Download allotment copy error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Unable to generate the allotment copy.",
      });
    }

    res.destroy(error);
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

const respondToAllotment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const applicantId = req.user.userId;

    const { allotmentId } = req.params;

    const { decision, remarks } = req.body;

    // ==================================================
    // VALIDATE DECISION
    // ==================================================

    if (!["ACCEPT", "REJECT"].includes(decision)) {
      return res.status(400).json({
        message: "Decision must be ACCEPT or REJECT.",
      });
    }

    session.startTransaction();

    // ==================================================
    // FIND OFFER
    // ==================================================

    const allotment = await Allotment.findOne({
      _id: allotmentId,
      applicantId,
    }).session(session);

    if (!allotment) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Allotment offer not found.",
      });
    }

    // ==================================================
    // OFFER MUST BE PENDING
    // ==================================================

    if (allotment.status !== "OFFERED") {
      await session.abortTransaction();

      return res.status(400).json({
        message: "This allotment offer has already been responded to.",
      });
    }

    // ==================================================
    // FIND APPLICATION
    // ==================================================

    const application = await Application.findById(
      allotment.applicationId,
    ).session(session);

    // ==================================================
    // FIND SCHEME
    // ==================================================

    const scheme = await HousingScheme.findById(allotment.schemeId).session(
      session,
    );

    // ==================================================
    // FIND APPLICANT
    // ==================================================

    const applicant = await User.findById(applicantId).session(session);

    if (!application || !scheme || !applicant) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Related allotment records could not be found.",
      });
    }

    // ==================================================
    // VERIFY APPLICATION / APPLICANT CONSISTENCY
    // ==================================================

    if (application.applicantId.toString() !== applicant._id.toString()) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Allotment applicant and application do not match.",
      });
    }

    // ==================================================
    // ACCEPT
    // ==================================================

    if (decision === "ACCEPT") {
      // ----------------------------------------------
      // Applicant must not already have another house
      // ----------------------------------------------

      if (applicant.housingStatus === "ALLOTTED") {
        await session.abortTransaction();

        return res.status(400).json({
          message: "Applicant has already been allotted a house.",
        });
      }

      // ----------------------------------------------
      // Update allotment
      // ----------------------------------------------

      allotment.status = "ACCEPTED";

      allotment.respondedAt = new Date();

      allotment.remarks = typeof remarks === "string" ? remarks.trim() : "";

      // ----------------------------------------------
      // Update applicant
      // ----------------------------------------------

      applicant.housingStatus = "ALLOTTED";

      // ----------------------------------------------
      // Keep application ELIGIBLE
      // ----------------------------------------------

      application.status = "ELIGIBLE";

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
            status: "REMOVED",

            removedAt: new Date(),

            removalReason: "ALLOTMENT_ACCEPTED",

            lastUpdated: new Date(),
          },
        },
        {
          session,
        },
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

    allotment.status = "REJECTED";

    allotment.respondedAt = new Date();

    allotment.remarks = typeof remarks === "string" ? remarks.trim() : "";

    application.status = "ELIGIBLE";

    applicant.housingStatus = "NOT_ALLOTTED";

    // ==================================================
    // FIND CONFIGURATION
    // ==================================================

    const configuration = scheme.configurations.id(allotment.configurationId);

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

    if (configuration.availableUnits >= configuration.totalUnits) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Configuration unit count is already at maximum capacity.",
      });
    }

    configuration.availableUnits += 1;

    // ==================================================
    // RESTORE WAITING LIST
    // ==================================================

    let waitingList = await WaitingList.findOne({
      applicationId: allotment.applicationId,
    }).session(session);

    if (waitingList) {
      waitingList.status = "ACTIVE";

      waitingList.removedAt = null;

      waitingList.removalReason = null;

      waitingList.lastUpdated = new Date();

      await waitingList.save({
        session,
      });
    } else {
      // ------------------------------------------------
      // Safety fallback
      // ------------------------------------------------

      const existingActiveCount = await WaitingList.countDocuments({
        schemeId: allotment.schemeId,

        district: allotment.district,

        status: "ACTIVE",
      }).session(session);

      waitingList = await WaitingList.create(
        [
          {
            applicantId: applicant._id,

            applicationId: application._id,

            schemeId: scheme._id,

            district: allotment.district,

            districtPosition: existingActiveCount + 1,

            status: "ACTIVE",

            removedAt: null,

            removalReason: null,

            lastUpdated: new Date(),
          },
        ],
        {
          session,
        },
      );

      waitingList = waitingList[0];
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

    console.error("Respond to allotment error:", error);

    return res.status(500).json({
      message: "Server error while responding to allotment.",
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
  getEligibleApplicantsForAllotment,
  downloadAllotmentCopy,
};
