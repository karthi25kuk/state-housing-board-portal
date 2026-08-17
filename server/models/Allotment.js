const mongoose = require("mongoose");

const allotmentSchema = new mongoose.Schema(
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
    },

    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HousingScheme",
      required: true,
    },

    houseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "House",
        required: true,
    },

    // Officer who processed the allotment
    allottedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --------------------------------------------------
    // ALLOTMENT OFFER
    // --------------------------------------------------

    offerDate: {
      type: Date,
      default: Date.now,
    },

    responseDeadline: {
      type: Date,
      required: true,
    },

    // --------------------------------------------------
    // APPLICANT RESPONSE
    // --------------------------------------------------

    response: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },

    responseDate: {
      type: Date,
      default: null,
    },

    // --------------------------------------------------
    // ALLOTMENT STATUS
    // --------------------------------------------------

    status: {
      type: String,
      enum: [
        "OFFERED",
        "ACCEPTED",
        "REJECTED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "OFFERED",
    },

    // Reason when rejected/cancelled
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Allotment",
  allotmentSchema
);