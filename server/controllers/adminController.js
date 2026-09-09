const HousingScheme = require("../models/HousingScheme");
const User = require("../models/User");
const Application = require("../models/Application");
const Allotment = require("../models/Allotment");

// ======================================================
// CREATE HOUSING SCHEME
// ======================================================

const createScheme = async (req, res) => {
  try {
    const adminId = req.user.userId;

    const {
      schemeName,
      description,
      eligibleIncomeCategories,
      maximumAnnualIncome,
      houseModel,
      price,
    } = req.body;

    // ==================================================
    // VALIDATE REQUIRED FIELDS
    // ==================================================

    if (
      !schemeName ||
      !description ||
      !eligibleIncomeCategories ||
      maximumAnnualIncome === undefined ||
      !houseModel ||
      price === undefined
    ) {
      return res.status(400).json({
        message:
          "Please provide all required housing scheme details.",
      });
    }

    // ==================================================
    // VALIDATE INCOME CATEGORIES
    // ==================================================

    if (
      !Array.isArray(eligibleIncomeCategories) ||
      eligibleIncomeCategories.length === 0
    ) {
      return res.status(400).json({
        message:
          "At least one eligible income category is required.",
      });
    }

    const allowedCategories = [
      "EWS",
      "LIG",
      "MIG",
      "HIG",
    ];

    const invalidCategory =
      eligibleIncomeCategories.some(
        (category) =>
          !allowedCategories.includes(category)
      );

    if (invalidCategory) {
      return res.status(400).json({
        message:
          "Invalid income category. Allowed categories are EWS, LIG, MIG and HIG.",
      });
    }

    // ==================================================
    // VALIDATE INCOME
    // ==================================================

    const parsedMaximumIncome =
      Number(maximumAnnualIncome);

    if (
      Number.isNaN(parsedMaximumIncome) ||
      parsedMaximumIncome < 0
    ) {
      return res.status(400).json({
        message:
          "Maximum annual income must be a valid non-negative number.",
      });
    }

    // ==================================================
    // VALIDATE PRICE
    // ==================================================

    const parsedPrice = Number(price);

    if (
      Number.isNaN(parsedPrice) ||
      parsedPrice < 0
    ) {
      return res.status(400).json({
        message:
          "House price must be a valid non-negative number.",
      });
    }

    // ==================================================
    // CREATE SCHEME
    // ==================================================

    const scheme = await HousingScheme.create({
      schemeName: schemeName.trim(),

      description: description.trim(),

      eligibleIncomeCategories,

      maximumAnnualIncome:
        parsedMaximumIncome,

      houseModel: houseModel.trim(),

      price: parsedPrice,

      status: "UPCOMING",

      createdBy: adminId,
    });

    res.status(201).json({
      message:
        "Housing scheme created successfully.",

      scheme,
    });
  } catch (error) {
    console.error(
      "Create scheme error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while creating housing scheme.",
    });
  }
};

// ======================================================
// CREATE OFFICER
// ======================================================

const createOfficer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      district,
    } = req.body;

    // ==================================================
    // VALIDATE REQUIRED FIELDS
    // ==================================================

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !district
    ) {
      return res.status(400).json({
        message:
          "Please provide name, email, phone, password, confirm password and district.",
      });
    }

    // ==================================================
    // VALIDATE PASSWORD
    // ==================================================

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must contain at least 6 characters.",
      });
    }

    // ==================================================
    // CHECK EXISTING USER
    // ==================================================

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "A user with this email already exists.",
      });
    }

    // ==================================================
    // HASH PASSWORD
    // ==================================================

    const bcrypt = require("bcryptjs");

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // ==================================================
    // CREATE OFFICER
    // ==================================================

    const officer = await User.create({
      name: name.trim(),

      email: email.trim().toLowerCase(),

      phone: phone.trim(),

      password: hashedPassword,

      role: "OFFICER",

      district: district.trim(),

      housingStatus: "NOT_ALLOTTED",

      isActive: true,
    });

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(201).json({
      message: "Officer created successfully.",

      officer: {
        _id: officer._id,
        name: officer.name,
        email: officer.email,
        phone: officer.phone,
        role: officer.role,
        district: officer.district,
        isActive: officer.isActive,
      },
    });
  } catch (error) {
    console.error(
      "Create officer error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while creating officer.",
    });
  }
};

// ======================================================
// GET ADMIN DASHBOARD
// ======================================================

const getAdminDashboard = async (req, res) => {
  try {
    // ==================================================
    // BASIC COUNTS
    // ==================================================

    const totalApplicants = await User.countDocuments({
      role: "APPLICANT",
    });

    const totalOfficers = await User.countDocuments({
      role: "OFFICER",
    });

    const totalApplications = await Application.countDocuments();

    const pendingVerification = await Application.countDocuments({
      status: {
        $in: ["SUBMITTED", "UNDER_VERIFICATION"],
      },
    });

    const housesAllotted = await Allotment.countDocuments({
      status: "ACCEPTED",
    });

    const totalAllotments = await Allotment.countDocuments();

    const activeSchemes = await HousingScheme.countDocuments({
      status: "OPEN",
    });

    const totalSchemes = await HousingScheme.countDocuments();

    const upcomingSchemes = await HousingScheme.countDocuments({
      status: "UPCOMING",
    });

    const closedSchemes = await HousingScheme.countDocuments({
      status: "CLOSED",
    });

    const completedSchemes = await HousingScheme.countDocuments({
      status: "COMPLETED",
    });

    // ==================================================
    // APPLICATION STATUS COUNTS
    // ==================================================

    const applicationStatusAggregation =
      await Application.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const applicationStatusCounts = {
      SUBMITTED: 0,
      UNDER_VERIFICATION: 0,
      ELIGIBLE: 0,
      INELIGIBLE: 0,
      WAITING_LIST: 0,
      ALLOTMENT_OFFERED: 0,
      ALLOTTED: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    applicationStatusAggregation.forEach((item) => {
      if (item._id) {
        applicationStatusCounts[item._id] = item.count;
      }
    });

    // ==================================================
    // RECENT APPLICATIONS
    // ==================================================

    const recentApplications = await Application.find()
      .populate(
        "applicantId",
        "name email phone district"
      )
      .populate(
        "schemeId",
        "schemeName status"
      )
      .sort({
        createdAt: -1,
      })
      .limit(10);

    // ==================================================
    // ALL HOUSING SCHEMES
    // ==================================================

    const schemes = await HousingScheme.find()
      .populate(
        "createdBy",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    // ==================================================
    // ALL OFFICERS
    // ==================================================

    const officers = await User.find({
      role: "OFFICER",
    })
      .select(
        "name email phone district isActive createdAt"
      )
      .sort({
        createdAt: -1,
      });

    // ==================================================
    // RESPONSE
    // ==================================================

    res.status(200).json({
      statistics: {
        totalApplicants,
        totalOfficers,
        totalApplications,
        pendingVerification,
        housesAllotted,
        totalAllotments,
        activeSchemes,
        totalSchemes,
        upcomingSchemes,
        closedSchemes,
        completedSchemes,
      },

      applicationStatusCounts,

      recentApplications,

      schemes,

      officers,
    });
  } catch (error) {
    console.error(
      "Get admin dashboard error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching admin dashboard.",
    });
  }
};


// ======================================================
// GET ALL HOUSING SCHEMES
// ======================================================

const getAllSchemes = async (req, res) => {
  try {
    const schemes = await HousingScheme.find()
      .populate(
        "createdBy",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      schemes,
    });
  } catch (error) {
    console.error(
      "Get all schemes error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching housing schemes.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createScheme,
  createOfficer,
  getAdminDashboard,
  getAllSchemes,

};