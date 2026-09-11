const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // ======================================================
    // APPLICATION NUMBER
    // ======================================================

    applicationNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    // ======================================================
    // APPLICANT
    // ======================================================

    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ======================================================
    // HOUSING SCHEME
    // ======================================================

    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HousingScheme",
      required: true,
      index: true,
    },

    // ======================================================
    // APPLICANT OFFICIAL DETAILS
    // ======================================================
    //
    // These are stored as a snapshot at application time.
    //
    // This is intentional.
    //
    // If the applicant later changes their profile address,
    // district, mobile number, etc., the submitted application
    // should continue to contain the details they actually
    // submitted for this scheme.
    //

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

    // ======================================================
    // DISTRICT
    // ======================================================
    //
    // This district determines:
    //
    // 1. Which officer can verify the application
    // 2. Which district ranking the application belongs to
    // 3. Which district configurations can allot a house
    //
    // Example:
    //
    // Application district = Madurai
    //
    // Madurai officer can verify it.
    //
    // It participates only in:
    //
    // Anna Scheme + Madurai ranking
    //
    // It CANNOT be allotted against:
    //
    // Anna Scheme + Chennai configuration
    //

    district: {
      type: String,
      required: true,
      trim: true,
      index: true,
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

    // ======================================================
    // FAMILY & INCOME DETAILS
    // ======================================================

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

    // ======================================================
    // DOCUMENTS
    // ======================================================

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

    // ======================================================
    // APPLICATION STATUS
    // ======================================================
    //
    // SUBMITTED
    //     Applicant submitted the application.
    //
    // UNDER_VERIFICATION
    //     Reserved for the verification workflow if required.
    //
    // ELIGIBLE
    //     Officer verified and approved the application.
    //     It can participate in district ranking.
    //
    // REJECTED
    //     Officer rejected the application.
    //     It does not participate in ranking.
    //
    // WITHDRAWN
    //     Applicant withdrew the application.
    //     It does not participate in ranking.
    //
    // IMPORTANT:
    //
    // WAITING_LIST is NOT stored here.
    //
    // Ranking is calculated from eligible applications.
    //
    // ALLOTMENT_OFFERED / ALLOTTED are NOT stored here.
    //
    // They belong to the separate Allotment model.
    //

    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "UNDER_VERIFICATION",
        "ELIGIBLE",
        "REJECTED",
        "WITHDRAWN",
      ],
      default: "SUBMITTED",
      index: true,
    },

    // ======================================================
    // VERIFICATION
    // ======================================================

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
      trim: true,
    },

    // ======================================================
    // SUBMISSION
    // ======================================================

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


// ======================================================
// PREVENT DUPLICATE APPLICATION
// ======================================================
//
// One applicant can register only once for a particular
// housing scheme.
//
// Applicant
//     +
// Scheme
//     =
// One Application
//

applicationSchema.index(
  {
    applicantId: 1,
    schemeId: 1,
  },
  {
    unique: true,
  }
);


// ======================================================
// DISTRICT RANKING INDEX
// ======================================================
//
// This supports queries such as:
//
// Find all eligible applicants for:
//     Anna Housing Scheme
//     Madurai district
//
// Ranking will be calculated by the ranking service.
//
// We do NOT store a permanent ranking number here.
//

applicationSchema.index({
  schemeId: 1,
  district: 1,
  status: 1,
  createdAt: 1,
});


// ======================================================
// OFFICER VERIFICATION INDEX
// ======================================================
//
// Useful when an officer needs to retrieve applications
// from their district that are waiting for verification.
//

applicationSchema.index({
  district: 1,
  status: 1,
  createdAt: -1,
});


// ======================================================
// MODEL
// ======================================================

module.exports = mongoose.model(
  "Application",
  applicationSchema
);