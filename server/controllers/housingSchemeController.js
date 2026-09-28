
const HousingScheme = require("../models/HousingScheme");

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const normalizeDistrict = (district) => {
  return district?.trim().toLowerCase();
};

const normalizeLocation = (location) => {
  return location?.trim().toLowerCase();
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
//
// The Officer must NEVER receive another officer's
// configuration as their own configuration.
//
// Therefore:
//
// - Common scheme information is returned.
// - Only the logged-in officer's configurations are
//   exposed.
// - Multiple configurations for the same district are
//   supported when they belong to the same officer.
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

    const schemes =
      await HousingScheme.find({})
        .populate(
          "createdBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    // ==================================================
    // RETURN ALL CONFIGURATIONS BELONGING TO THIS
    // OFFICER + DISTRICT
    // ==================================================

    const officerSchemes =
      schemes.map((scheme) => {
        const officerConfigurations =
          scheme.configurations.filter(
            (configuration) =>
              configuration.officer &&
              configuration.officer.toString() ===
                officerId.toString() &&
              normalizeDistrict(
                configuration.district
              ) ===
                normalizedOfficerDistrict
          );

        const schemeObject =
          scheme.toObject();

        // IMPORTANT:
        //
        // Hide other officers' configurations.

        schemeObject.configurations =
          officerConfigurations;

        return {
          ...schemeObject,

          // Backward-compatible first configuration.
          officerConfiguration:
            officerConfigurations[0] ||
            null,

          // Complete list for multiple locations.
          officerConfigurations,

          isConfigured:
            officerConfigurations.length >
            0,
        };
      });

    return res.status(200).json({
      schemes:
        officerSchemes,
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
// officerConfigurations = ALL configurations belonging
// to the logged-in Officer in their district.
//
// Other district/officer configurations are hidden.
//
// ======================================================

const getOfficerSchemeById = async (
  req,
  res
) => {
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
      normalizeDistrict(
        officerDistrict
      );

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
    // FIND ALL CONFIGURATIONS BELONGING TO THE
    // LOGGED-IN OFFICER + DISTRICT
    // ==================================================

    const officerConfigurations =
      scheme.configurations.filter(
        (configuration) =>
          configuration.officer &&
          configuration.officer.toString() ===
            officerId.toString() &&
          normalizeDistrict(
            configuration.district
          ) ===
            normalizedOfficerDistrict
      );

    // ==================================================
    // HIDE OTHER CONFIGURATIONS
    // ==================================================

    const schemeObject =
      scheme.toObject();

    schemeObject.configurations =
      officerConfigurations;

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      scheme:
        schemeObject,

      // Backward-compatible first configuration.
      officerConfiguration:
        officerConfigurations[0] ||
        null,

      // Complete configurations for this officer.
      officerConfigurations,

      isConfigured:
        officerConfigurations.length >
        0,
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
// Multiple locations are allowed for:
//
//     SAME SCHEME
//     SAME DISTRICT
//     SAME OFFICER
//
// But the same location cannot be duplicated.
//
// ======================================================

const updateSchemeDetails = async (
  req,
  res
) => {
  try {
    const officerId =
      req.user.userId;

    const officerDistrict =
      req.user.district;

    const {
      configurationId,
      location,
      totalUnits,
      allotmentDate,
    } = req.body;

    const { schemeId } =
      req.params;

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
      normalizeDistrict(
        officerDistrict
      );

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

    const normalizedLocation =
      normalizeLocation(location);

    // ==================================================
    // VALIDATE TOTAL UNITS
    // ==================================================

    const parsedTotalUnits =
      Number(totalUnits);

    if (
      !Number.isFinite(
        parsedTotalUnits
      ) ||
      !Number.isInteger(
        parsedTotalUnits
      ) ||
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
    // Admin creates the common scheme.
    //
    // Officer later creates one or more configurations
    // for their district.
    //
    // ==================================================

    if (!configurationId) {
      // ----------------------------------------------
      // CHECK DUPLICATE LOCATION
      // ----------------------------------------------
      //
      // Same scheme + district + officer + location
      // cannot be duplicated.
      //
      // Different locations are allowed.
      //

      const duplicateConfiguration =
        scheme.configurations.find(
          (configuration) =>
            configuration.officer &&
            configuration.officer.toString() ===
              officerId.toString() &&
            normalizeDistrict(
              configuration.district
            ) ===
              normalizedOfficerDistrict &&
            normalizeLocation(
              configuration.location
            ) ===
              normalizedLocation
        );

      if (
        duplicateConfiguration
      ) {
        return res.status(409).json({
          message:
            "This housing scheme already has a configuration for that location.",
        });
      }

      // ----------------------------------------------
      // CHECK DISTRICT OWNERSHIP
      // ----------------------------------------------
      //
      // One district within one scheme must have only
      // one responsible officer.
      //
      // Multiple locations for that district are allowed
      // when they belong to the same officer.
      //

      const existingDistrictConfiguration =
        scheme.configurations.find(
          (configuration) =>
            normalizeDistrict(
              configuration.district
            ) ===
            normalizedOfficerDistrict
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
      // CREATE CONFIGURATION
      // ----------------------------------------------

      scheme.configurations.push({
        district:
          officerDistrict.trim(),

        officer:
          officerId,

        location:
          location.trim(),

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
      ) !==
      normalizedOfficerDistrict
    ) {
      return res.status(403).json({
        message:
          "You can modify configurations only from your own district.",
      });
    }

    // ==================================================
    // CHECK DUPLICATE LOCATION DURING UPDATE
    // ==================================================
    //
    // Exclude the configuration currently being edited.
    //
    // This prevents:
    //
    // Location A
    // Location B
    //
    // from becoming:
    //
    // Location A
    // Location A
    //
    // ==================================================

    const duplicateConfiguration =
      scheme.configurations.find(
        (existingConfiguration) =>
          existingConfiguration._id.toString() !==
            configuration._id.toString() &&
          existingConfiguration.officer &&
          existingConfiguration.officer.toString() ===
            officerId.toString() &&
          normalizeDistrict(
            existingConfiguration.district
          ) ===
            normalizedOfficerDistrict &&
          normalizeLocation(
            existingConfiguration.location
          ) ===
            normalizedLocation
      );

    if (
      duplicateConfiguration
    ) {
      return res.status(409).json({
        message:
          "Another configuration already exists for that housing location.",
      });
    }

    // ==================================================
    // CALCULATE ALREADY ALLOCATED / OCCUPIED UNITS
    // ==================================================

    const alreadyAllocated =
      Number(
        configuration.totalUnits || 0
      ) -
      Number(
        configuration.availableUnits || 0
      );

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

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        message:
          "This housing configuration already exists.",
      });
    }

    if (
      error.name ===
      "ValidationError"
    ) {
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
// IMPORTANT:
//
// A scheme is STANDARD and exists independently of
// district configuration.
//
// Applicant can see and apply for ALL schemes.
//
// Configuration is required only later for allotment.
//
// ======================================================

const getOpenSchemes = async (
  req,
  res
) => {
  try {
    // ==================================================
    // GET ALL STANDARD SCHEMES
    // ==================================================
    //
    // DO NOT FILTER BY CONFIGURATION.
    //

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
    // RETURN STANDARD SCHEME INFORMATION
    // ==================================================

    const applicantSchemes =
      schemes.map(
        toApplicantScheme
      );

    return res.status(200).json({
      schemes:
        applicantSchemes,
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
// ======================================================

const getSchemeById = async (
  req,
  res
) => {
  try {
    const { schemeId } =
      req.params;

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
      req.user.role ===
      "APPLICANT"
    ) {
      return res.status(200).json({
        scheme:
          toApplicantScheme(
            scheme
          ),
      });
    }

    // ==================================================
    // OFFICER ACCESS
    // ==================================================

    if (
      req.user.role ===
      "OFFICER"
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

      const normalizedOfficerDistrict =
        normalizeDistrict(
          officerDistrict
        );

      // ----------------------------------------------
      // FIND ALL CONFIGURATIONS BELONGING TO THIS
      // OFFICER + DISTRICT
      // ----------------------------------------------

      const officerConfigurations =
        scheme.configurations.filter(
          (configuration) =>
            configuration.officer &&
            configuration.officer.toString() ===
              officerId.toString() &&
            normalizeDistrict(
              configuration.district
            ) ===
              normalizedOfficerDistrict
        );

      // ----------------------------------------------
      // HIDE OTHER CONFIGURATIONS
      // ----------------------------------------------

      const schemeObject =
        scheme.toObject();

      schemeObject.configurations =
        officerConfigurations;

      return res.status(200).json({
        scheme:
          schemeObject,

        // Backward-compatible first configuration.
        officerConfiguration:
          officerConfigurations[0] ||
          null,

        // All configurations for this officer.
        officerConfigurations,

        isConfigured:
          officerConfigurations.length >
          0,
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

