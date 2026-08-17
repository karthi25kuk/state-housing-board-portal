const mongoose = require("mongoose");

const waitingListSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // REFERENCES
    // --------------------------------------------------

    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },

    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HousingScheme",
      required: true,
    },

    // --------------------------------------------------
    // DISTRICT
    // --------------------------------------------------

    district: {
      type: String,
      required: true,
      trim: true,
    },

    // --------------------------------------------------
    // WAITING LIST POSITIONS
    // --------------------------------------------------

    // Overall waiting list position for the scheme
    overallPosition: {
      type: Number,
      required: true,
      min: 1,
    },

    // Waiting list position within applicant's district
    districtPosition: {
      type: Number,
      required: true,
      min: 1,
    },

    // --------------------------------------------------
    // STATUS
    // --------------------------------------------------

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "SELECTED",
        "ALLOTMENT_OFFERED",
        "ALLOTTED",
        "REMOVED",
      ],
      default: "ACTIVE",
    },

    // --------------------------------------------------
    // POSITION UPDATE
    // --------------------------------------------------

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "WaitingList",
  waitingListSchema
);