const mongoose = require("mongoose");

const allotmentSchema = new mongoose.Schema(
  {
    // ==========================================
    // REFERENCES
    // ==========================================

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },

    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HousingScheme",
      required: true,
    },

    waitingListId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WaitingList",
      required: true,
      unique: true,
    },

    // ==========================================
    // HOUSE INFORMATION
    // ==========================================

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

    // ==========================================
    // ALLOTMENT STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "OFFERED",
        "ACCEPTED",
        "REJECTED",
        "CANCELLED",
      ],
      default: "OFFERED",
    },

    // ==========================================
    // OFFER INFORMATION
    // ==========================================

    offeredAt: {
      type: Date,
      default: Date.now,
    },

    respondedAt: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // OFFICER
    // ==========================================

    allottedBy: {
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
  "Allotment",
  allotmentSchema
);