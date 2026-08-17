const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Account Information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // User Role
    role: {
      type: String,
      enum: ["ADMIN", "OFFICER", "APPLICANT"],
      default: "APPLICANT",
    },

    // District assigned to the user
    // Required only for OFFICER
    district: {
      type: String,
      trim: true,
      default: null,
    },

    // Housing Status
    housingStatus: {
      type: String,
      enum: ["NOT_ALLOTTED", "ALLOTTED"],
      default: "NOT_ALLOTTED",
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);