const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // ==========================================
    // APPLICATION NUMBER
    // ==========================================

    applicationNumber: {
      type: String,
      unique: true,
      required: true,
    },

    // ==========================================
    // APPLICANT
    // ==========================================

    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // SCHEME
    // ==========================================

    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HousingScheme",
      required: true,
    },

    // ==========================================
    // APPLICATION DETAILS
    // ==========================================

    familyMembers: {
      type: Number,
      required: true,
      min: 1,
    },

    annualIncome: {
      type: Number,
      required: true,
      min: 0,
    },

    incomeCategory: {
      type: String,
      enum: ["EWS", "LIG", "MIG", "HIG"],
      required: true,
    },

    employmentStatus: {
      type: String,
      enum: [
        "EMPLOYED",
        "SELF_EMPLOYED",
        "UNEMPLOYED",
        "RETIRED",
      ],
      required: true,
    },

    // ==========================================
    // APPLICATION STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "UNDER_VERIFICATION",
        "ELIGIBLE",
        "INELIGIBLE",
        "WAITING_LIST",
        "ALLOTMENT_OFFERED",
        "ALLOTTED",
        "REJECTED",
        "WITHDRAWN",
      ],
      default: "SUBMITTED",
    },

    // ==========================================
    // VERIFICATION
    // ==========================================

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verificationRemarks: {
      type: String,
      default: "",
    },

    // ==========================================
    // SUBMISSION
    // ==========================================

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same applicant from applying
// to the same scheme more than once.
applicationSchema.index(
  {
    applicantId: 1,
    schemeId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Application",
  applicationSchema
);