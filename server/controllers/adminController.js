const bcrypt = require("bcryptjs");

const HousingScheme = require("../models/HousingScheme");
const User = require("../models/User");
const Application = require("../models/Application");
const Allotment = require("../models/Allotment");
const WaitingList = require("../models/WaitingList");

// ======================================================
// CREATE HOUSING SCHEME
// ======================================================
//
// Admin creates ONLY the common scheme details.
//
// Admin does NOT create:
// - District configuration
// - Officer assignment
// - Location
// - Number of units
// - Allotment date
//
// Officers configure operational housing details later.
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
    // REQUIRED FIELDS
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
    // STRING VALIDATION
    // ==================================================

    if (
      typeof schemeName !== "string" ||
      typeof description !== "string" ||
      typeof houseModel !== "string"
    ) {
      return res.status(400).json({
        message:
          "Scheme name, description and house model must be text values.",
      });
    }

    const normalizedSchemeName = schemeName.trim();
    const normalizedDescription = description.trim();
    const normalizedHouseModel = houseModel.trim();

    if (
      !normalizedSchemeName ||
      !normalizedDescription ||
      !normalizedHouseModel
    ) {
      return res.status(400).json({
        message:
          "Scheme name, description and house model cannot be empty.",
      });
    }

    // ==================================================
    // INCOME CATEGORIES
    // ==================================================

    const allowedCategories = [
      "EWS",
      "LIG",
      "MIG",
      "HIG",
    ];

    if (
      !Array.isArray(eligibleIncomeCategories) ||
      eligibleIncomeCategories.length === 0
    ) {
      return res.status(400).json({
        message:
          "At least one eligible income category is required.",
      });
    }

    const uniqueCategories = [
      ...new Set(
        eligibleIncomeCategories.map((category) =>
          String(category).trim().toUpperCase()
        )
      ),
    ];

    const invalidCategory = uniqueCategories.some(
      (category) => !allowedCategories.includes(category)
    );

    if (invalidCategory) {
      return res.status(400).json({
        message:
          "Invalid income category. Allowed categories are EWS, LIG, MIG and HIG.",
      });
    }

    // ==================================================
    // MAXIMUM ANNUAL INCOME
    // ==================================================

    const parsedMaximumIncome = Number(maximumAnnualIncome);

    if (
      !Number.isFinite(parsedMaximumIncome) ||
      parsedMaximumIncome < 0
    ) {
      return res.status(400).json({
        message:
          "Maximum annual income must be a valid non-negative number.",
      });
    }

    // ==================================================
    // HOUSE PRICE
    // ==================================================

    const parsedPrice = Number(price);

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      return res.status(400).json({
        message:
          "House price must be a valid non-negative number.",
      });
    }

    // ==================================================
    // DUPLICATE SCHEME NAME
    // ==================================================

    const existingScheme = await HousingScheme.findOne({
      schemeName: normalizedSchemeName,
    });

    if (existingScheme) {
      return res.status(409).json({
        message:
          "A housing scheme with this name already exists.",
      });
    }

    // ==================================================
    // CREATE COMMON SCHEME
    // ==================================================

    const scheme = await HousingScheme.create({
      schemeName: normalizedSchemeName,
      description: normalizedDescription,
      eligibleIncomeCategories: uniqueCategories,
      maximumAnnualIncome: parsedMaximumIncome,
      houseModel: normalizedHouseModel,
      price: parsedPrice,
      configurations: [],
      createdBy: adminId,
    });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      message: "Housing scheme created successfully.",
      scheme,
    });
  } catch (error) {
    console.error("Create scheme error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A housing scheme with these details already exists.",
      });
    }

    return res.status(500).json({
      message:
        "Server error while creating housing scheme.",
    });
  }
};

// ======================================================
// CREATE OFFICER
// ======================================================
//
// Only ADMIN can create officers.
//
// Each officer belongs to exactly one district.
// The officer can later configure schemes for that
// district.
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
    // REQUIRED FIELDS
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
    // NORMALIZE VALUES
    // ==================================================

    const normalizedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).trim();
    const normalizedDistrict = String(district).trim();

    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedPhone ||
      !normalizedDistrict
    ) {
      return res.status(400).json({
        message:
          "Name, email, phone and district cannot be empty.",
      });
    }

    // ==================================================
    // EMAIL VALIDATION
    // ==================================================

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      return res.status(400).json({
        message:
          "Please provide a valid email address.",
      });
    }

    // ==================================================
    // PHONE VALIDATION
    // ==================================================

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({
        message:
          "Please provide a valid 10-digit Indian mobile number.",
      });
    }

    // ==================================================
    // PASSWORD VALIDATION
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
      email: normalizedEmail,
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

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // ==================================================
    // CREATE OFFICER
    // ==================================================

    const officer = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role: "OFFICER",
      district: normalizedDistrict,
      housingStatus: "NOT_ALLOTTED",
      isActive: true,
    });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      message: "Officer created successfully.",
      officer: {
        _id: officer._id,
        name: officer.name,
        email: officer.email,
        phone: officer.phone,
        role: officer.role,
        district: officer.district,
        isActive: officer.isActive,
        createdAt: officer.createdAt,
      },
    });
  } catch (error) {
    console.error("Create officer error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A user with this email already exists.",
      });
    }

    return res.status(500).json({
      message:
        "Server error while creating officer.",
    });
  }
};

// ======================================================
// GET ADMIN DASHBOARD
// ======================================================
//
// Dashboard statistics are based on:
//
// User
// Application
// WaitingList
// Allotment
// HousingScheme configurations
//
// No HousingScheme.status is used.
// ======================================================

const getAdminDashboard = async (req, res) => {
  try {
    // ==================================================
    // USER COUNTS
    // ==================================================

    const totalApplicants = await User.countDocuments({
      role: "APPLICANT",
    });

    const totalOfficers = await User.countDocuments({
      role: "OFFICER",
    });

    // ==================================================
    // APPLICATION COUNTS
    // ==================================================

    const totalApplications =
      await Application.countDocuments();

    const submittedApplications =
      await Application.countDocuments({
        status: "SUBMITTED",
      });

    const underVerification =
      await Application.countDocuments({
        status: "UNDER_VERIFICATION",
      });

    const eligibleApplications =
      await Application.countDocuments({
        status: "ELIGIBLE",
      });

    const rejectedApplications =
      await Application.countDocuments({
        status: "REJECTED",
      });

    const withdrawnApplications =
      await Application.countDocuments({
        status: "WITHDRAWN",
      });

    // ==================================================
    // WAITING LIST COUNTS
    // ==================================================

    const activeWaitingListEntries =
      await WaitingList.countDocuments({
        status: "ACTIVE",
      });

    const removedWaitingListEntries =
      await WaitingList.countDocuments({
        status: "REMOVED",
      });

    // ==================================================
    // ALLOTMENT COUNTS
    // ==================================================

    const totalAllotments =
      await Allotment.countDocuments();

    const offeredAllotments =
      await Allotment.countDocuments({
        status: "OFFERED",
      });

    const acceptedAllotments =
      await Allotment.countDocuments({
        status: "ACCEPTED",
      });

    const rejectedAllotments =
      await Allotment.countDocuments({
        status: "REJECTED",
      });

    const cancelledAllotments =
      await Allotment.countDocuments({
        status: "CANCELLED",
      });

    // ==================================================
    // SCHEME COUNTS
    // ==================================================
    //
    // A scheme is a common scheme.
    //
    // Operational district availability is represented
    // by embedded configurations.
    //
    // ==================================================

    const totalSchemes =
      await HousingScheme.countDocuments();

    const schemesWithConfigurations =
      await HousingScheme.countDocuments({
        "configurations.0": {
          $exists: true,
        },
      });

    // ==================================================
    // TOTAL HOUSING UNITS
    // ==================================================

    const schemeUnitAggregation =
      await HousingScheme.aggregate([
        {
          $unwind: {
            path: "$configurations",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $group: {
            _id: null,
            totalUnits: {
              $sum: "$configurations.totalUnits",
            },
            availableUnits: {
              $sum: "$configurations.availableUnits",
            },
          },
        },
      ]);

    const totalUnits =
      schemeUnitAggregation.length > 0
        ? schemeUnitAggregation[0].totalUnits
        : 0;

    const availableUnits =
      schemeUnitAggregation.length > 0
        ? schemeUnitAggregation[0].availableUnits
        : 0;

    const allottedUnits =
      totalUnits - availableUnits;

    // ==================================================
    // RECENT APPLICATIONS
    // ==================================================

    const recentApplications =
      await Application.find()
        .populate(
          "applicantId",
          "name email phone district"
        )
        .populate(
          "schemeId",
          "schemeName houseModel price"
        )
        .sort({
          createdAt: -1,
        })
        .limit(10);

    // ==================================================
    // ALL SCHEMES
    // ==================================================

    const schemes =
      await HousingScheme.find()
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "configurations.officer",
          "name email phone district"
        )
        .sort({
          createdAt: -1,
        });

    // ==================================================
    // ALL OFFICERS
    // ==================================================

    const officers =
      await User.find({
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

    return res.status(200).json({
      statistics: {
        totalApplicants,
        totalOfficers,

        totalApplications,
        submittedApplications,
        underVerification,
        eligibleApplications,
        rejectedApplications,
        withdrawnApplications,

        activeWaitingListEntries,
        removedWaitingListEntries,

        totalAllotments,
        offeredAllotments,
        acceptedAllotments,
        rejectedAllotments,
        cancelledAllotments,

        totalSchemes,
        schemesWithConfigurations,

        totalUnits,
        availableUnits,
        allottedUnits,

        housesAllotted: acceptedAllotments,
      },

      applicationStatusCounts: {
        SUBMITTED: submittedApplications,
        UNDER_VERIFICATION: underVerification,
        ELIGIBLE: eligibleApplications,
        REJECTED: rejectedApplications,
        WITHDRAWN: withdrawnApplications,
      },

      allotmentStatusCounts: {
        OFFERED: offeredAllotments,
        ACCEPTED: acceptedAllotments,
        REJECTED: rejectedAllotments,
        CANCELLED: cancelledAllotments,
      },

      waitingListStatistics: {
        ACTIVE: activeWaitingListEntries,
        REMOVED: removedWaitingListEntries,
      },

      recentApplications,
      schemes,
      officers,
    });
  } catch (error) {
    console.error(
      "Get admin dashboard error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching admin dashboard.",
    });
  }
};

// ======================================================
// GET ALL HOUSING SCHEMES
// ======================================================
//
// Admin can view every common scheme and all district
// configurations.
// ======================================================

const getAllSchemes = async (req, res) => {
  try {
    const schemes =
      await HousingScheme.find()
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "configurations.officer",
          "name email phone district"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      schemes,
    });
  } catch (error) {
    console.error(
      "Get all schemes error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching housing schemes.",
    });
  }
};

// ======================================================
// GET ALL OFFICERS
// ======================================================
//
// Admin management page.
// ======================================================

const getAllOfficers = async (req, res) => {
  try {
    const officers =
      await User.find({
        role: "OFFICER",
      })
        .select(
          "name email phone district isActive createdAt"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      officers,
    });
  } catch (error) {
    console.error(
      "Get all officers error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching officers.",
    });
  }
};

// ======================================================
// UPDATE OFFICER ACTIVE STATUS
// ======================================================
//
// Admin can activate/deactivate an officer.
//
// Existing configurations and historical records are
// preserved.
// ======================================================

const updateOfficerStatus = async (req, res) => {
  try {
    const { officerId } = req.params;
    const { isActive } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message:
          "isActive must be a boolean value.",
      });
    }

    // ==================================================
    // FIND OFFICER
    // ==================================================

    const officer =
      await User.findOne({
        _id: officerId,
        role: "OFFICER",
      });

    if (!officer) {
      return res.status(404).json({
        message: "Officer not found.",
      });
    }

    // ==================================================
    // UPDATE STATUS
    // ==================================================

    officer.isActive = isActive;

    await officer.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      message: isActive
        ? "Officer activated successfully."
        : "Officer deactivated successfully.",

      officer: {
        _id: officer._id,
        name: officer.name,
        email: officer.email,
        phone: officer.phone,
        district: officer.district,
        role: officer.role,
        isActive: officer.isActive,
      },
    });
  } catch (error) {
    console.error(
      "Update officer status error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while updating officer status.",
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
  getAllOfficers,
  updateOfficerStatus,
};