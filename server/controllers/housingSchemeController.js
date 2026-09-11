const HousingScheme = require("../models/HousingScheme");

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const normalizeDistrict = (district) => {
  return district?.trim().toLowerCase();
};

const toApplicantScheme = (scheme) => {
  const schemeObject = scheme.toObject();

  return {
    _id: schemeObject._id,
    schemeName: schemeObject.schemeName,
    description: schemeObject.description,
    eligibleIncomeCategories:
      schemeObject.eligibleIncomeCategories,
    maximumAnnualIncome:
      schemeObject.maximumAnnualIncome,
    houseModel: schemeObject.houseModel,
    price: schemeObject.price,
    createdAt: schemeObject.createdAt,
    updatedAt: schemeObject.updatedAt,
  };
};

// ======================================================
// GET OFFICER SCHEMES
// ======================================================
//
// Officer can see ALL common schemes created by Admin.
//
// IMPORTANT:
// The Officer must NEVER receive another officer's
// configuration as their own configuration.
//
// Therefore:
//
// - Common scheme information is returned.
// - Only the logged-in officer's configuration is exposed.
// - Other officers' configurations are hidden from the
//   Officer response.
//
// ======================================================

const getOfficerSchemes = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    // ==================================================
    // VALIDATE OFFICER DISTRICT
    // ==================================================

    if (
      !officerDistrict ||
      !officerDistrict.trim()
    ) {
      return res.status(400).json({
        message:
          "Officer district is not configured.",
      });
    }

    const normalizedOfficerDistrict =
      normalizeDistrict(officerDistrict);

    // ==================================================
    // GET ALL COMMON SCHEMES
    // ==================================================

    const schemes = await HousingScheme.find({})
      .populate("createdBy", "name email")
      .sort({
        createdAt: -1,
      });

    // ==================================================
    // RETURN ONLY THIS OFFICER'S CONFIGURATION
    // ==================================================

    const officerSchemes = schemes.map((scheme) => {
      const officerConfigurations =
        scheme.configurations.filter(
          (configuration) =>
            configuration.officer &&
            configuration.officer.toString() ===
              officerId.toString() &&
            normalizeDistrict(
              configuration.district
            ) === normalizedOfficerDistrict
        );

      const schemeObject = scheme.toObject();

      // IMPORTANT:
      // Do not expose other officers' configurations
      // to this officer.
      schemeObject.configurations =
        officerConfigurations;

      return {
        ...schemeObject,

        officerConfiguration:
          officerConfigurations[0] || null,

        officerConfigurations,

        isConfigured:
          officerConfigurations.length > 0,
      };
    });

    return res.status(200).json({
      schemes: officerSchemes,
    });
  } catch (error) {
    console.error(
      "Get officer schemes error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching housing schemes.",
    });
  }
};

// ======================================================
// GET SINGLE SCHEME FOR OFFICER
// ======================================================
//
// Officer can open ANY common scheme.
//
// If not configured for the Officer's district:
//
// officerConfiguration = null
//
// If configured:
//
// officerConfiguration = ONLY that officer's
// configuration.
//
// Other district/officer configurations are hidden.
// ======================================================

const getOfficerSchemeById = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;
    const { schemeId } = req.params;

    // ==================================================
    // VALIDATE OFFICER DISTRICT
    // ==================================================

    if (
      !officerDistrict ||
      !officerDistrict.trim()
    ) {
      return res.status(400).json({
        message:
          "Officer district is not configured.",
      });
    }

    const normalizedOfficerDistrict =
      normalizeDistrict(officerDistrict);

    // ==================================================
    // FIND COMMON SCHEME
    // ==================================================

    const scheme =
      await HousingScheme.findById(
        schemeId
      ).populate(
        "createdBy",
        "name email"
      );

    if (!scheme) {
      return res.status(404).json({
        message:
          "Housing scheme not found.",
      });
    }

    // ==================================================
    // FIND ONLY LOGGED-IN OFFICER CONFIGURATION
    // ==================================================

    const officerConfigurations =
      scheme.configurations.filter(
        (configuration) =>
          configuration.officer &&
          configuration.officer.toString() ===
            officerId.toString() &&
          normalizeDistrict(
            configuration.district
          ) === normalizedOfficerDistrict
      );

    // ==================================================
    // HIDE OTHER CONFIGURATIONS
    // ==================================================

    const schemeObject = scheme.toObject();

    schemeObject.configurations =
      officerConfigurations;

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      scheme: schemeObject,

      officerConfiguration:
        officerConfigurations[0] || null,

      officerConfigurations,

      isConfigured:
        officerConfigurations.length > 0,
    });
  } catch (error) {
    console.error(
      "Get officer scheme error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching housing scheme.",
    });
  }
};

// ======================================================
// UPDATE SCHEME OPERATIONAL DETAILS
// ======================================================
//
// ADMIN controls common scheme information.
//
// OFFICER controls ONLY their own district:
//
// - location
// - totalUnits
// - allotmentDate
//
// configurationId is optional.
//
// No configurationId:
//     Create configuration.
//
// configurationId:
//     Update existing configuration.
//
// ======================================================

const updateSchemeDetails = async (req, res) => {
  try {
    const officerId = req.user.userId;
    const officerDistrict = req.user.district;

    const {
      configurationId,
      location,
      totalUnits,
      allotmentDate,
    } = req.body;

    const { schemeId } = req.params;

    // ==================================================
    // VALIDATE OFFICER DISTRICT
    // ==================================================

    if (
      !officerDistrict ||
      !officerDistrict.trim()
    ) {
      return res.status(400).json({
        message:
          "Officer district is not configured.",
      });
    }

    const normalizedOfficerDistrict =
      normalizeDistrict(officerDistrict);

    // ==================================================
    // VALIDATE LOCATION
    // ==================================================

    if (
      !location ||
      typeof location !== "string" ||
      !location.trim()
    ) {
      return res.status(400).json({
        message:
          "Housing location is required.",
      });
    }

    // ==================================================
    // VALIDATE TOTAL UNITS
    // ==================================================

    const parsedTotalUnits =
      Number(totalUnits);

    if (
      !Number.isFinite(parsedTotalUnits) ||
      !Number.isInteger(parsedTotalUnits) ||
      parsedTotalUnits < 1
    ) {
      return res.status(400).json({
        message:
          "Total units must be a positive whole number.",
      });
    }

    // ==================================================
    // VALIDATE ALLOTMENT DATE
    // ==================================================

    if (!allotmentDate) {
      return res.status(400).json({
        message:
          "Allotment date is required.",
      });
    }

    const parsedAllotmentDate =
      new Date(allotmentDate);

    if (
      Number.isNaN(
        parsedAllotmentDate.getTime()
      )
    ) {
      return res.status(400).json({
        message:
          "Please provide a valid allotment date.",
      });
    }

    // ==================================================
    // FIND COMMON SCHEME
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
    // CREATE NEW CONFIGURATION
    // ==================================================
    //
    // Admin creates standard scheme.
    //
    // Officer later creates configuration for
    // their own district.
    //
    // ==================================================

    if (!configurationId) {
      const duplicateConfiguration =
        scheme.configurations.find(
          (configuration) =>
            configuration.officer &&
            configuration.officer.toString() ===
              officerId.toString() &&
            normalizeDistrict(
              configuration.district
            ) === normalizedOfficerDistrict &&
            normalizeDistrict(
              configuration.location
            ) === normalizeDistrict(location)
        );

      if (duplicateConfiguration) {
        return res.status(409).json({
          message:
            "This housing scheme already has a configuration for that location.",
        });
      }

      // ----------------------------------------------
      // Check whether another officer already owns
      // this district configuration.
      //
      // One district must have one responsible
      // officer for a particular scheme.
      // ----------------------------------------------

      const existingDistrictConfiguration =
        scheme.configurations.find(
          (configuration) =>
            normalizeDistrict(
              configuration.district
            ) === normalizedOfficerDistrict
        );

      if (
        existingDistrictConfiguration &&
        existingDistrictConfiguration.officer?.toString() !==
          officerId.toString()
      ) {
        return res.status(409).json({
          message:
            "This housing scheme is already configured for your district by another officer.",
        });
      }

      // ----------------------------------------------
      // Create configuration
      // ----------------------------------------------

      scheme.configurations.push({
        district: officerDistrict.trim(),

        officer: officerId,

        location: location.trim(),

        totalUnits:
          parsedTotalUnits,

        availableUnits:
          parsedTotalUnits,

        allotmentDate:
          parsedAllotmentDate,
      });

      await scheme.save();

      const newConfiguration =
        scheme.configurations[
          scheme.configurations.length - 1
        ];

      return res.status(201).json({
        message:
          "Housing scheme configuration created successfully.",

        scheme,

        configuration:
          newConfiguration,
      });
    }

    // ==================================================
    // FIND EXISTING CONFIGURATION
    // ==================================================

    const configuration =
      scheme.configurations.id(
        configurationId
      );

    if (!configuration) {
      return res.status(404).json({
        message:
          "Housing configuration not found.",
      });
    }

    // ==================================================
    // CHECK CONFIGURATION OWNER
    // ==================================================

    if (
      !configuration.officer ||
      configuration.officer.toString() !==
        officerId.toString()
    ) {
      return res.status(403).json({
        message:
          "You can modify only your own district configuration.",
      });
    }

    // ==================================================
    // CHECK CONFIGURATION DISTRICT
    // ==================================================

    if (
      normalizeDistrict(
        configuration.district
      ) !== normalizedOfficerDistrict
    ) {
      return res.status(403).json({
        message:
          "You can modify configurations only from your own district.",
      });
    }

    // ==================================================
    // CALCULATE ALREADY ALLOCATED/OCCUPIED UNITS
    // ==================================================

    const alreadyAllocated =
      Number(configuration.totalUnits || 0) -
      Number(configuration.availableUnits || 0);

    // ==================================================
    // PREVENT INVALID REDUCTION
    // ==================================================

    if (
      parsedTotalUnits <
      alreadyAllocated
    ) {
      return res.status(400).json({
        message:
          `Total units cannot be less than ${alreadyAllocated}, ` +
          "because some units have already been allocated.",
      });
    }

    // ==================================================
    // UPDATE CONFIGURATION
    // ==================================================

    configuration.location =
      location.trim();

    configuration.totalUnits =
      parsedTotalUnits;

    configuration.availableUnits =
      parsedTotalUnits -
      alreadyAllocated;

    configuration.allotmentDate =
      parsedAllotmentDate;

    await scheme.save();

    return res.status(200).json({
      message:
        "Housing configuration updated successfully.",

      scheme,

      configuration,
    });
  } catch (error) {
    console.error(
      "Update scheme details error:",
      error
    );

    // ==================================================
    // MONGOOSE DUPLICATE / VALIDATION ERROR
    // ==================================================

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This housing configuration already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message:
          error.message ||
          "Invalid housing configuration.",
      });
    }

    return res.status(500).json({
      message:
        "Server error while updating housing configuration.",
    });
  }
};

// ======================================================
// GET ALL STANDARD SCHEMES FOR APPLICANT
// ======================================================
//
// IMPORTANT WORKFLOW CHANGE:
//
// A scheme is STANDARD and exists independently of
// district configuration.
//
// Therefore:
//
// Applicant district = Erode
//
// Scheme A:
//   Erode configuration exists
//
// Scheme B:
//   Erode configuration DOES NOT exist
//
// Applicant must still be able to SEE and APPLY for
// BOTH Scheme A and Scheme B.
//
// Application does NOT depend on configuration.
//
// Configuration is required only later for:
//     ranking → allotment
//
// ======================================================

const getOpenSchemes = async (req, res) => {
  try {
    // ==================================================
    // GET ALL STANDARD SCHEMES
    // ==================================================
    //
    // DO NOT FILTER BY CONFIGURATION.
    //
    // This is intentional.
    //
    // Applicants can apply before the Officer creates
    // the district configuration.
    //
    // ==================================================

    const schemes =
      await HousingScheme.find({})
        .populate(
          "createdBy",
          "name"
        )
        .sort({
          createdAt: -1,
        });

    // ==================================================
    // ATTACH DISTRICT CONFIGURATION IF AVAILABLE
    // ==================================================
    //
    // This is informational only.
    //
    // It MUST NOT determine whether the scheme can
    // be applied for.
    //
    // ==================================================

    const applicantSchemes = schemes.map(
      toApplicantScheme
    );

    return res.status(200).json({
      schemes: applicantSchemes,
    });
  } catch (error) {
    console.error(
      "Get applicant schemes error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching housing schemes.",
    });
  }
};

// ======================================================
// GET SCHEME BY ID
// ======================================================
//
// ADMIN:
//
// Can view any scheme.
//
// OFFICER:
//
// Can view any common scheme so that it can be
// configured for their district.
//
// APPLICANT:
//
// Can view ANY standard scheme.
//
// IMPORTANT:
//
// Applicant does NOT need a district configuration
// to open the scheme.
//
// The absence of configuration only means that
// allotment cannot happen yet.
//
// ======================================================

const getSchemeById = async (req, res) => {
  try {
    const { schemeId } = req.params;

    const scheme =
      await HousingScheme.findById(
        schemeId
      ).populate(
        "createdBy",
        "name email"
      );

    if (!scheme) {
      return res.status(404).json({
        message:
          "Housing scheme not found.",
      });
    }

    // ==================================================
    // APPLICANT ACCESS
    // ==================================================

    if (
      req.user.role === "APPLICANT"
    ) {
      return res.status(200).json({
        scheme: toApplicantScheme(scheme),
      });
    }

    // ==================================================
    // OFFICER ACCESS
    // ==================================================

    if (
      req.user.role === "OFFICER"
    ) {
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

      const officerConfiguration =
        scheme.configurations.find(
          (configuration) =>
            configuration.officer &&
            configuration.officer.toString() ===
              officerId.toString() &&
            normalizeDistrict(
              configuration.district
            ) ===
              normalizeDistrict(
                officerDistrict
              )
        );

      // Hide other officer configurations.
      const schemeObject =
        scheme.toObject();

      schemeObject.configurations =
        officerConfiguration
          ? [officerConfiguration]
          : [];

      return res.status(200).json({
        scheme: schemeObject,

        officerConfiguration:
          officerConfiguration || null,

        isConfigured:
          !!officerConfiguration,
      });
    }

    // ==================================================
    // ADMIN ACCESS
    // ==================================================

    return res.status(200).json({
      scheme,
    });
  } catch (error) {
    console.error(
      "Get scheme by ID error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching housing scheme.",
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
  getOpenSchemes,
  getSchemeById,
};