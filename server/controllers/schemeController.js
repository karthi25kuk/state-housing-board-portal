const HousingScheme = require("../models/HousingScheme");

// ==========================================
// CREATE HOUSING SCHEME
// ==========================================

const createScheme = async (req, res) => {
  try {
    // User information comes from JWT
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    const {
      schemeName,
      description,
      location,
      houseModel,
      price,
      totalUnits,
      applicationStartDate,
      applicationEndDate,
      eligibleIncomeCategories,
    } = req.body;

    // Check required fields
    if (
      !schemeName ||
      !description ||
      !location ||
      !houseModel ||
      price === undefined ||
      totalUnits === undefined ||
      !applicationStartDate ||
      !applicationEndDate
    ) {
      return res.status(400).json({
        message: "Please provide all required scheme details.",
      });
    }

    // Officer must have a district
    if (!officerDistrict) {
      return res.status(400).json({
        message: "Officer district is not assigned.",
      });
    }

    // Validate dates
    if (
      new Date(applicationStartDate) >=
      new Date(applicationEndDate)
    ) {
      return res.status(400).json({
        message:
          "Application end date must be after start date.",
      });
    }

    // Create scheme
    const scheme = await HousingScheme.create({
      schemeName,
      description,
      district: officerDistrict,
      location,
      houseModel,
      price,
      totalUnits,
      availableUnits: totalUnits,
      applicationStartDate,
      applicationEndDate,
      eligibleIncomeCategories:
        eligibleIncomeCategories || [],
      status: "UPCOMING",
      createdBy: officerId,
    });

    res.status(201).json({
      message: "Housing scheme created successfully.",
      scheme,
    });
  } catch (error) {
    console.error("Create scheme error:", error);

    res.status(500).json({
      message: "Server error while creating housing scheme.",
    });
  }
};


// ==========================================
// GET OPEN SCHEMES
// ==========================================

const getOpenSchemes = async (req, res) => {
  try {
    const schemes = await HousingScheme.find({
      status: "OPEN",
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      schemes,
    });
  } catch (error) {
    console.error("Get schemes error:", error);

    res.status(500).json({
      message: "Server error while fetching schemes.",
    });
  }
};


// ==========================================
// GET OFFICER'S SCHEMES
// ==========================================

const getOfficerSchemes = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    const schemes = await HousingScheme.find({
      createdBy: officerId,
      district: officerDistrict,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      schemes,
    });
  } catch (error) {
    console.error("Get officer schemes error:", error);

    res.status(500).json({
      message: "Server error while fetching officer schemes.",
    });
  }
};

// ==========================================
// OPEN / PUBLISH SCHEME
// ==========================================

const openScheme = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    const { schemeId } = req.params;

    const scheme = await HousingScheme.findOne({
      _id: schemeId,
      createdBy: officerId,
      district: officerDistrict,
    });

    if (!scheme) {
      return res.status(404).json({
        message: "Scheme not found or access denied.",
      });
    }

    if (scheme.status !== "UPCOMING") {
      return res.status(400).json({
        message: "Only upcoming schemes can be opened.",
      });
    }

    scheme.status = "OPEN";

    await scheme.save();

    res.status(200).json({
      message: "Housing scheme is now open for applications.",
      scheme,
    });
  } catch (error) {
    console.error("Open scheme error:", error);

    res.status(500).json({
      message: "Server error while opening scheme.",
    });
  }
};


// ==========================================
// GET SINGLE SCHEME
// ==========================================

const getSchemeById = async (req, res) => {
  try {
    const { schemeId } = req.params;

    const scheme = await HousingScheme.findById(schemeId);

    if (!scheme) {
      return res.status(404).json({
        message: "Housing scheme not found.",
      });
    }

    res.status(200).json({
      scheme,
    });
  } catch (error) {
    console.error("Get scheme error:", error);

    res.status(500).json({
      message: "Server error while fetching scheme.",
    });
  }
};


module.exports = {
  createScheme,
  getOpenSchemes,
  getOfficerSchemes,
  openScheme,
  getSchemeById,
};