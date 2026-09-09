const HousingScheme = require("../models/HousingScheme");

// ======================================================
// GET ALL SCHEMES FOR OFFICER
// ======================================================

const getOfficerSchemes = async (req, res) => {
  try {
    // All officers can see all housing schemes
    const schemes = await HousingScheme.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      schemes,
    });
  } catch (error) {
    console.error("Get officer schemes error:", error);

    res.status(500).json({
      message: "Server error while fetching housing schemes.",
    });
  }
};

// ======================================================
// GET SINGLE ASSIGNED SCHEME
// ======================================================

const getOfficerSchemeById = async (req, res) => {
  try {
    const { schemeId } = req.params;

    const scheme = await HousingScheme.findById(schemeId).populate(
      "createdBy",
      "name email",
    );

    if (!scheme) {
      return res.status(404).json({
        message: "Housing scheme not found.",
      });
    }

    res.status(200).json({
      scheme,
    });
  } catch (error) {
    console.error("Get officer scheme error:", error);

    res.status(500).json({
      message: "Server error while fetching scheme.",
    });
  }
};

// ======================================================
// UPDATE OFFICER OPERATIONAL DETAILS
// ======================================================

const updateSchemeDetails = async (req, res) => {
  try {
    const { schemeId } = req.params;
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    const {
      totalUnits,
      location,
      applicationStartDate,
      applicationEndDate,
    } = req.body;

    if (
      totalUnits === undefined ||
      !location ||
      !applicationStartDate ||
      !applicationEndDate
    ) {
      return res.status(400).json({
        message:
          "Please provide total units, location, application start date and application end date.",
      });
    }

    if (!officerDistrict) {
      return res.status(400).json({
        message: "Officer district is not configured.",
      });
    }

    const parsedTotalUnits = Number(totalUnits);

    if (
      !Number.isInteger(parsedTotalUnits) ||
      parsedTotalUnits < 1
    ) {
      return res.status(400).json({
        message: "Total units must be a positive whole number.",
      });
    }

    if (!location.trim()) {
      return res.status(400).json({
        message: "Housing location cannot be empty.",
      });
    }

    const startDate = new Date(applicationStartDate);
    const endDate = new Date(applicationEndDate);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid application start or end date.",
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        message:
          "Application end date must be after application start date.",
      });
    }

    const scheme = await HousingScheme.findById(schemeId);

    if (!scheme) {
      return res.status(404).json({
        message: "Housing scheme not found.",
      });
    }

    if (scheme.status !== "UPCOMING") {
      return res.status(400).json({
        message: "Only upcoming schemes can be configured.",
      });
    }

    // Find this officer's district entry
    const districtEntry = scheme.districtDetails.find(
      (item) => item.district === officerDistrict
    );

    if (districtEntry) {
      // Update existing district details
      districtEntry.officer = officerId;
      districtEntry.totalUnits = parsedTotalUnits;
      districtEntry.availableUnits = parsedTotalUnits;
      districtEntry.location = location.trim();
      districtEntry.applicationStartDate = startDate;
      districtEntry.applicationEndDate = endDate;
    } else {
      // Add new district details
      scheme.districtDetails.push({
        district: officerDistrict,
        officer: officerId,
        totalUnits: parsedTotalUnits,
        availableUnits: parsedTotalUnits,
        location: location.trim(),
        applicationStartDate: startDate,
        applicationEndDate: endDate,
      });
    }

    await scheme.save();

    res.status(200).json({
      message:
        `Operational details saved successfully for ${officerDistrict} district.`,
      scheme,
    });
  } catch (error) {
    console.error("Update scheme details error:", error);

    res.status(500).json({
      message:
        "Server error while updating scheme details.",
    });
  }
};

// ======================================================
// OPEN / PUBLISH SCHEME
// ======================================================

const openScheme = async (req, res) => {
  try {

    const { schemeId } = req.params;

    const scheme = await HousingScheme.findById(schemeId);

    if (!scheme) {
      return res.status(404).json({
        message: "Housing scheme not found.",
      });
    }

    // ==================================================
    // ONLY UPCOMING SCHEMES
    // ==================================================

    if (scheme.status !== "UPCOMING") {
      return res.status(400).json({
        message: "Only upcoming schemes can be opened.",
      });
    }

    // ==================================================
    // VALIDATE UNITS
    // ==================================================

    if (!scheme.totalUnits || scheme.totalUnits < 1) {
      return res.status(400).json({
        message:
          "Please configure the number of housing units before opening the scheme.",
      });
    }

    // ==================================================
    // VALIDATE LOCATION
    // ==================================================

    if (!scheme.location || !scheme.location.trim()) {
      return res.status(400).json({
        message:
          "Please provide the housing location before opening the scheme.",
      });
    }

    // ==================================================
    // VALIDATE APPLICATION PERIOD
    // ==================================================

    if (!scheme.applicationStartDate || !scheme.applicationEndDate) {
      return res.status(400).json({
        message:
          "Please configure the application period before opening the scheme.",
      });
    }

    if (
      new Date(scheme.applicationStartDate) >=
      new Date(scheme.applicationEndDate)
    ) {
      return res.status(400).json({
        message: "Application end date must be after application start date.",
      });
    }

    // ==================================================
    // MAKE ALL UNITS AVAILABLE
    // ==================================================

    scheme.availableUnits = scheme.totalUnits;

    // ==================================================
    // OPEN SCHEME
    // ==================================================

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

// ======================================================
// GET OPEN SCHEMES FOR APPLICANTS
// ======================================================

const getOpenSchemes = async (req, res) => {
  try {
    const now = new Date();

    const schemes = await HousingScheme.find({
      status: "OPEN",

      applicationStartDate: {
        $lte: now,
      },

      applicationEndDate: {
        $gte: now,
      },
    })
      .sort({
        applicationEndDate: 1,
      });

    res.status(200).json({
      schemes,
    });
  } catch (error) {
    console.error("Get open schemes error:", error);

    res.status(500).json({
      message: "Server error while fetching open schemes.",
    });
  }
};

// ======================================================
// GET SINGLE SCHEME
// ======================================================

const getSchemeById = async (req, res) => {
  try {
    const { schemeId } = req.params;

    const scheme = await HousingScheme.findById(schemeId)
      .populate("createdBy", "name email");

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

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getOfficerSchemes,
  getOfficerSchemeById,
  updateSchemeDetails,
  openScheme,
  getOpenSchemes,
  getSchemeById,
};
