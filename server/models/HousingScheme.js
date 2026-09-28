const mongoose = require("mongoose");

// ======================================================
// SCHEME CONFIGURATION
// ======================================================
//
// One common Housing Scheme can have multiple district
// configurations.
//
// Example:
//
// Anna Housing Scheme
//
// Configuration 1
//   District: Madurai
//   Officer: Officer A
//   Location: Thiruparankundram
//   Total Units: 5
//   Available Units: 5
//   Allotment Date: 2026-10-10
//
// Configuration 2
//   District: Chennai
//   Officer: Officer B
//   Location: Tambaram
//   Total Units: 8
//   Available Units: 8
//   Allotment Date: 2026-10-15
//
// IMPORTANT:
//
// Ranking is handled separately by WaitingList:
//
//     Scheme + District
//
// Ranking does NOT belong inside the scheme
// configuration.
//
// ======================================================

const schemeConfigurationSchema =
  new mongoose.Schema(
    {
      // ==================================================
      // DISTRICT
      // ==================================================

      district: {
        type: String,
        required: true,
        trim: true,
      },

      // ==================================================
      // OFFICER RESPONSIBLE
      // ==================================================

      officer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      // ==================================================
      // HOUSING LOCATION
      // ==================================================

      location: {
        type: String,
        required: true,
        trim: true,
      },

      // ==================================================
      // TOTAL UNITS
      // ==================================================

      totalUnits: {
        type: Number,
        required: true,
        min: 1,
      },

      // ==================================================
      // AVAILABLE UNITS
      // ==================================================
      //
      // Initially:
      //
      // totalUnits = 5
      // availableUnits = 5
      //
      // After an active offer:
      //
      // totalUnits = 5
      // availableUnits = 4
      //
      // If the offer is rejected:
      //
      // availableUnits = 5
      //
      // If the offer is accepted:
      //
      // availableUnits remains 4.
      //
      // ==================================================

      availableUnits: {
        type: Number,
        required: true,
        min: 0,
      },

      // ==================================================
      // ALLOTMENT DATE
      // ==================================================

      allotmentDate: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

// ======================================================
// CONFIGURATION VALIDATION
// ======================================================

schemeConfigurationSchema.pre(
  "validate",
  function () {
    // --------------------------------------------------
    // AVAILABLE UNITS CANNOT EXCEED TOTAL UNITS
    // --------------------------------------------------

    if (
      this.availableUnits !== undefined &&
      this.totalUnits !== undefined &&
      this.availableUnits > this.totalUnits
    ) {
      throw new Error(
        `Available units cannot be greater than total units for ${this.district} - ${this.location}.`
      );
    }

    // --------------------------------------------------
    // AVAILABLE UNITS CANNOT BE NEGATIVE
    // --------------------------------------------------

    if (
      this.availableUnits !== undefined &&
      this.availableUnits < 0
    ) {
      throw new Error(
        `Available units cannot be negative for ${this.district} - ${this.location}.`
      );
    }

    // --------------------------------------------------
    // TOTAL UNITS MUST BE POSITIVE
    // --------------------------------------------------

    if (
      this.totalUnits !== undefined &&
      this.totalUnits < 1
    ) {
      throw new Error(
        `Total units must be at least 1 for ${this.district} - ${this.location}.`
      );
    }

    // --------------------------------------------------
    // ALLOTMENT DATE
    // --------------------------------------------------

    if (!this.allotmentDate) {
      throw new Error(
        `Allotment date is required for ${this.district} - ${this.location}.`
      );
    }

    // --------------------------------------------------
    // OFFICER
    // --------------------------------------------------

    if (!this.officer) {
      throw new Error(
        `Officer is required for ${this.district} - ${this.location}.`
      );
    }
  }
);

// ======================================================
// HOUSING SCHEME
// ======================================================
//
// This represents the COMMON scheme created by ADMIN.
//
// Admin controls:
//
// - schemeName
// - description
// - eligibleIncomeCategories
// - maximumAnnualIncome
// - houseModel
// - price
//
// Officers control their own district configuration.
//
// ======================================================

const housingSchemeSchema =
  new mongoose.Schema(
    {
      // ==================================================
      // ADMIN CONTROLLED DETAILS
      // ==================================================

      schemeName: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        required: true,
        trim: true,
      },

      // ==================================================
      // ELIGIBILITY
      // ==================================================

      eligibleIncomeCategories: {
        type: [String],

        enum: [
          "EWS",
          "LIG",
          "MIG",
          "HIG",
        ],

        required: true,

        validate: {
          validator: function (categories) {
            return (
              Array.isArray(categories) &&
              categories.length > 0
            );
          },

          message:
            "At least one eligible income category is required.",
        },
      },

      maximumAnnualIncome: {
        type: Number,
        required: true,
        min: 0,
      },

      // ==================================================
      // HOUSE DETAILS
      // ==================================================

      houseModel: {
        type: String,
        required: true,
        trim: true,
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      // ==================================================
      // DISTRICT CONFIGURATIONS
      // ==================================================
      //
      // Admin-created scheme may initially have:
      //
      // configurations: []
      //
      // Officer later adds:
      //
      // {
      //   district,
      //   officer,
      //   location,
      //   totalUnits,
      //   availableUnits,
      //   allotmentDate
      // }
      //
      // ==================================================

      configurations: {
        type: [schemeConfigurationSchema],
        default: [],
      },

      // ==================================================
      // CREATED BY ADMIN
      // ==================================================

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

// ======================================================
// SCHEME VALIDATION
// ======================================================
//
// A district within one scheme should normally be
// managed by one officer.
//
// Multiple locations/configurations can still exist
// for the same district.
//
// Example:
//
// Madurai
//   ├── Thiruparankundram -> Officer A
//   └── Alagar Kovil      -> Officer A
//
// But:
//
// Madurai
//   ├── Location A -> Officer A
//   └── Location B -> Officer B
//
// is rejected.
//
// ======================================================

housingSchemeSchema.pre(
  "validate",
  function () {
    const districtOfficers = new Map();

    for (const configuration of this.configurations) {
      const district =
        configuration.district
          ?.trim()
          .toLowerCase();

      if (!district) {
        continue;
      }

      const officer =
        configuration.officer?.toString();

      if (!officer) {
        continue;
      }

      if (
        districtOfficers.has(district) &&
        districtOfficers.get(district) !==
          officer
      ) {
        throw new Error(
          `Multiple officers cannot manage the same district (${configuration.district}) within one housing scheme.`
        );
      }

      districtOfficers.set(
        district,
        officer
      );
    }
  }
);

// ======================================================
// INDEXES
// ======================================================
//
// IMPORTANT:
//
// These indexes are declared ONLY here.
//
// Do not add index: true to the individual
// configuration fields above.
//
// This prevents Mongoose duplicate-index warnings.
//
// ======================================================

// ------------------------------------------------------
// Find schemes by officer configuration
// ------------------------------------------------------

housingSchemeSchema.index({
  "configurations.officer": 1,
});

// ------------------------------------------------------
// Find schemes by district configuration
// ------------------------------------------------------

housingSchemeSchema.index({
  "configurations.district": 1,
});

// ------------------------------------------------------
// Find configurations by allotment date
// ------------------------------------------------------

housingSchemeSchema.index({
  "configurations.allotmentDate": 1,
});

// ------------------------------------------------------
// Admin-created schemes
// ------------------------------------------------------

housingSchemeSchema.index({
  createdBy: 1,
  createdAt: -1,
});

// ======================================================
// MODEL
// ======================================================

module.exports =
  mongoose.model(
    "HousingScheme",
    housingSchemeSchema
  );