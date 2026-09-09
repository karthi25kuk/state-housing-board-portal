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
    // HOUSING SCHEME
    // ==========================================

    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HousingScheme",
      required: true,
    },

    // ==========================================
    // APPLICANT OFFICIAL DETAILS
    // ==========================================

    aadhaarNumber: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pinCode: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // FAMILY & INCOME DETAILS
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
        "OTHER",
      ],
      required: true,
    },

    occupation: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // DOCUMENTS
    // ==========================================

    incomeCertificateUrl: {
      type: String,
      required: true,
      trim: true,
    },

    aadhaarDocumentUrl: {
      type: String,
      required: true,
      trim: true,
    },

    addressProofUrl: {
      type: String,
      required: true,
      trim: true,
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

// ==========================================
// PREVENT DUPLICATE APPLICATION
// ==========================================

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