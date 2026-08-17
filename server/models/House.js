const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // HOUSING SCHEME
    // --------------------------------------------------

    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HousingScheme",
      required: true,
    },

    // --------------------------------------------------
    // HOUSE DETAILS
    // --------------------------------------------------

    houseNumber: {
      type: String,
      required: true,
      trim: true,
    },

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

    location: {
      type: String,
      required: true,
      trim: true,
    },

    // District is kept with the house
    // for district-level management.
    district: {
      type: String,
      required: true,
      trim: true,
    },

    // --------------------------------------------------
    // HOUSE STATUS
    // --------------------------------------------------

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "OFFERED",
        "ALLOTTED",
        "RESERVED",
        "UNAVAILABLE",
      ],
      default: "AVAILABLE",
    },

    // --------------------------------------------------
    // ALLOTMENT REFERENCE
    // --------------------------------------------------

    allottedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    allotmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Allotment",
      default: null,
    },

    // --------------------------------------------------
    // CREATED BY OFFICER
    // --------------------------------------------------

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

module.exports = mongoose.model("House", houseSchema);