const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // REFERENCES
    // --------------------------------------------------

    // Applicant who uploaded the document
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Application to which the document belongs
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    // --------------------------------------------------
    // DOCUMENT INFORMATION
    // --------------------------------------------------

    documentType: {
      type: String,
      enum: [
        "AADHAAR",
        "INCOME_CERTIFICATE",
        "ADDRESS_PROOF",
        "COMMUNITY_CERTIFICATE",
        "PHOTO",
        "OTHER",
      ],
      required: true,
    },

    documentName: {
      type: String,
      required: true,
      trim: true,
    },

    // Path or URL of uploaded file
    fileUrl: {
      type: String,
      required: true,
    },

    // --------------------------------------------------
    // VERIFICATION
    // --------------------------------------------------

    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },

    verificationRemarks: {
      type: String,
      trim: true,
      default: "",
    },

    // Officer who verified the document
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);