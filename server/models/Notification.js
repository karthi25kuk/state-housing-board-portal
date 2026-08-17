const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // RECIPIENT
    // --------------------------------------------------

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --------------------------------------------------
    // RELATED RECORDS
    // --------------------------------------------------

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },

    allotmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Allotment",
      default: null,
    },

    // --------------------------------------------------
    // NOTIFICATION INFORMATION
    // --------------------------------------------------

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "APPLICATION",
        "DOCUMENT",
        "WAITING_LIST",
        "ALLOTMENT",
        "SYSTEM",
      ],
      default: "SYSTEM",
    },

    // --------------------------------------------------
    // READ STATUS
    // --------------------------------------------------

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);