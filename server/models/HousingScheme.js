const mongoose = require("mongoose");

const housingSchemeSchema = new mongoose.Schema(
  {
    // Basic Scheme Information
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

    // District where the scheme is available
    district: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    // House Information
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

    // House Availability
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

    // Eligibility
    eligibleIncomeCategories: {
      type: [String],
      default: [],
    },

    // Application Period
    applicationStartDate: {
      type: Date,
      required: true,
    },

    applicationEndDate: {
      type: Date,
      required: true,
    },

    // Scheme Status
    status: {
      type: String,
      enum: ["UPCOMING", "OPEN", "CLOSED", "COMPLETED"],
      default: "UPCOMING",
    },

    // Officer who created the scheme
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

module.exports = mongoose.model(
  "HousingScheme",
  housingSchemeSchema
);