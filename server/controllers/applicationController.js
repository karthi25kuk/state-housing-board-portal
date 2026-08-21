const Application = require("../models/Application");
const HousingScheme = require("../models/HousingScheme");
const User = require("../models/User");

// ==========================================
// GENERATE APPLICATION NUMBER
// ==========================================

const generateApplicationNumber = () => {
  const year = new Date().getFullYear();

  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `SHA-${year}-${randomNumber}`;
};


// ==========================================
// APPLY FOR HOUSING SCHEME
// ==========================================

const createApplication = async (req, res) => {
  try {
    const applicantId = req.user.userId;

    const {
      schemeId,
      familyMembers,
      annualIncome,
      incomeCategory,
      employmentStatus,
    } = req.body;

    // Validate required fields
    if (
      !schemeId ||
      !familyMembers ||
      annualIncome === undefined ||
      !incomeCategory ||
      !employmentStatus
    ) {
      return res.status(400).json({
        message:
          "Please provide all required application details.",
      });
    }

    // Get applicant
    const applicant = await User.findById(applicantId);

    if (!applicant) {
      return res.status(404).json({
        message: "Applicant not found.",
      });
    }

    // Applicant already has a house
    if (applicant.housingStatus === "ALLOTTED") {
      return res.status(403).json({
        message:
          "You have already been allotted a house and cannot apply for another housing scheme.",
      });
    }

    // Get scheme
    const scheme = await HousingScheme.findById(schemeId);

    if (!scheme) {
      return res.status(404).json({
        message: "Housing scheme not found.",
      });
    }

    // Scheme must be OPEN
    if (scheme.status !== "OPEN") {
      return res.status(400).json({
        message:
          "Applications are currently not open for this scheme.",
      });
    }

    // Check application dates
    const today = new Date();

    if (
      today < new Date(scheme.applicationStartDate)
    ) {
      return res.status(400).json({
        message:
          "Applications for this scheme have not started yet.",
      });
    }

    if (
      today > new Date(scheme.applicationEndDate)
    ) {
      return res.status(400).json({
        message:
          "The application period for this scheme has ended.",
      });
    }

    // Check duplicate application
    const existingApplication =
      await Application.findOne({
        applicantId,
        schemeId,
      });

    if (existingApplication) {
      return res.status(409).json({
        message:
          "You have already applied for this housing scheme.",
      });
    }

    // Check income category
    if (
      !scheme.eligibleIncomeCategories.includes(
        incomeCategory
      )
    ) {
      return res.status(400).json({
        message:
          "You are not eligible for this scheme based on your income category.",
      });
    }

    // Create application
    const application = await Application.create({
      applicationNumber:
        generateApplicationNumber(),

      applicantId,

      schemeId,

      familyMembers,

      annualIncome,

      incomeCategory,

      employmentStatus,

      status: "SUBMITTED",

      submittedAt: new Date(),
    });

    res.status(201).json({
      message:
        "Housing scheme application submitted successfully.",

      application,
    });
  } catch (error) {
    console.error(
      "Create application error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "You have already applied for this scheme.",
      });
    }

    res.status(500).json({
      message:
        "Server error while submitting application.",
    });
  }
};


// ==========================================
// GET APPLICANT APPLICATIONS
// ==========================================

const getMyApplications = async (req, res) => {
  try {
    const applicantId = req.user.userId;

    const applications = await Application.find({
      applicantId,
    })
      .populate(
        "schemeId",
        "schemeName district location houseModel price status"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      applications,
    });
  } catch (error) {
    console.error(
      "Get applications error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching applications.",
    });
  }
};


// ==========================================
// GET SINGLE APPLICATION - APPLICANT
// ==========================================

const getMyApplicationById = async (req, res) => {
  try {
    const applicantId = req.user.userId;

    const { applicationId } = req.params;

    const application = await Application.findOne({
      _id: applicationId,
      applicantId,
    }).populate(
      "schemeId",
      "schemeName district location houseModel price"
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    res.status(200).json({
      application,
    });
  } catch (error) {
    console.error(
      "Get application error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching application.",
    });
  }
};

// ==========================================
// GET APPLICATIONS FOR OFFICER
// ==========================================

const getOfficerApplications = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    // ------------------------------------------
    // Officer must have a district
    // ------------------------------------------

    if (!officerDistrict) {
      return res.status(400).json({
        message: "Officer district is not assigned.",
      });
    }

    // ------------------------------------------
    // Find schemes belonging to this officer
    // and district
    // ------------------------------------------

    const schemes = await HousingScheme.find({
      createdBy: officerId,
      district: officerDistrict,
    }).select("_id");

    const schemeIds = schemes.map((scheme) => scheme._id);

    // ------------------------------------------
    // Find applications for those schemes
    // ------------------------------------------

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
// EXPORTS
// ==========================================

module.exports = {
  createApplication,
  getMyApplications,
  getMyApplicationById,
  getOfficerApplications,
  
};

