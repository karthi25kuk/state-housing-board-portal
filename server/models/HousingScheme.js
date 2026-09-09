const mongoose = require("mongoose");

// ======================================================
// DISTRICT DETAILS
// ======================================================

const districtDetailsSchema = new mongoose.Schema(
  {
    district: {
      type: String,
      required: true,
      trim: true,
    },

    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalUnits: {
      type: Number,
      required: true,
      min: 1,
    },

    availableUnits: {
      type: Number,
      required: true,
      min: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    applicationStartDate: {
      type: Date,
      required: true,
    },

    applicationEndDate: {
      type: Date,
      required: true,
    },
  },
  {
    _id: true,
  }
);

// ======================================================
// HOUSING SCHEME
// ======================================================

const housingSchemeSchema = new mongoose.Schema(
  {
    // ==================================================
    // ADMIN CONTROLLED
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

    eligibleIncomeCategories: {
      type: [String],
      enum: ["EWS", "LIG", "MIG", "HIG"],
      required: true,
      validate: {
        validator: function (categories) {
          return categories.length > 0;
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
    // DISTRICT-WISE OPERATIONAL DETAILS
    // ==================================================

    districtDetails: {
      type: [districtDetailsSchema],
      default: [],
    },

    // ==================================================
    // SCHEME STATUS
    // ==================================================

    status: {
      type: String,
      enum: [
        "UPCOMING",
        "OPEN",
        "CLOSED",
        "COMPLETED",
      ],
      default: "UPCOMING",
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
// VALIDATE DISTRICT DETAILS
// ======================================================

housingSchemeSchema.pre("validate", function () {
  for (const district of this.districtDetails) {
    if (
      district.applicationEndDate <=
      district.applicationStartDate
    ) {
      throw new Error(
        `Application end date must be after start date for ${district.district}.`
      );
    }

    if (
      district.availableUnits >
      district.totalUnits
    ) {
      throw new Error(
        `Available units cannot be greater than total units for ${district.district}.`
      );
    }
  }
});

module.exports = mongoose.model(
  "HousingScheme",
  housingSchemeSchema
);