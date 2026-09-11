const mongoose = require("mongoose");

const allotmentSchema = new mongoose.Schema(
  {
    // ======================================================
    // APPLICATION
    // ======================================================

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    // ======================================================
    // APPLICANT
    // ======================================================

    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ======================================================
    // HOUSING SCHEME
    // ======================================================

    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HousingScheme",
      required: true,
    },

    // ======================================================
    // CONFIGURATION
    // ======================================================
    //
    // Every configuration inside HousingScheme has its own
    // MongoDB _id.
    //
    // Example:
    //
    // Anna Housing Scheme
    //
    // Configuration A
    //   Madurai
    //   Thiruparankundram
    //   5 units
    //
    // Configuration B
    //   Madurai
    //   Alagar Kovil
    //   10 units
    //
    // An allotment MUST identify which configuration
    // supplied the house.
    //

    configurationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // ======================================================
    // DISTRICT
    // ======================================================
    //
    // Stored as a snapshot so that the allotment clearly
    // records the district for which the house was allotted.
    //
    // Ranking and allotment are always district-wise.
    //

    district: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================================
    // LOCATION
    // ======================================================
    //
    // Snapshot of the configuration location.
    //

    location: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================================
    // HOUSE INFORMATION
    // ======================================================

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

    // ======================================================
    // ALLOTMENT STATUS
    // ======================================================
    //
    // OFFERED
    //     System has offered a house to the applicant.
    //
    // ACCEPTED
    //     Applicant accepted the house.
    //
    // REJECTED
    //     Applicant rejected the offer.
    //
    // CANCELLED
    //     Admin/system cancelled the allotment if required.
    //
    // IMPORTANT:
    //
    // Once ACCEPTED:
    //
    //     applicant gets one house
    //             ↓
    //     applicant is removed from all other rankings
    //
    // If REJECTED:
    //
    //     applicant does NOT get a house
    //             ↓
    //     configuration unit becomes available
    //             ↓
    //     next eligible applicant is selected
    //

    status: {
      type: String,
      enum: [
        "OFFERED",
        "ACCEPTED",
        "REJECTED",
        "CANCELLED",
      ],
      default: "OFFERED",
      index: true,
    },

    // ======================================================
    // OFFER INFORMATION
    // ======================================================

    offeredAt: {
      type: Date,
      default: Date.now,
    },

    respondedAt: {
      type: Date,
      default: null,
    },

    // ======================================================
    // APPLICANT RESPONSE
    // ======================================================

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================================
    // OFFICER
    // ======================================================
    //
    // Officer responsible for the district configuration.
    //

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


// ======================================================
// INDEXES
// ======================================================

// ------------------------------------------------------
// Find allotments for an applicant
// ------------------------------------------------------

allotmentSchema.index({
  applicantId: 1,
  status: 1,
});


// ------------------------------------------------------
// Find allotments for a scheme
// ------------------------------------------------------

allotmentSchema.index({
  schemeId: 1,
  status: 1,
});


// ------------------------------------------------------
// Find allotments for a particular configuration
// ------------------------------------------------------

allotmentSchema.index({
  configurationId: 1,
  status: 1,
});


// ------------------------------------------------------
// Find allotments by district
// ------------------------------------------------------

allotmentSchema.index({
  schemeId: 1,
  district: 1,
  status: 1,
});


// ======================================================
// ONE APPLICATION → ONE ACTIVE ALLOTMENT
// ======================================================
//
// We should NOT use:
//
// applicationId: unique
//
// because the same application may receive multiple
// sequential offers if previous offers are rejected.
//
// Example:
//
// Priya → Configuration A → REJECTED
// Priya → Configuration B → OFFERED
//
// Therefore applicationId cannot be globally unique.
//
// The application may have multiple historical allotment
// records, but only one should be active at a time.
//
// This is enforced in the allotment service/controller
// using a transaction/conditional query.
//

// ======================================================
// MODEL
// ======================================================

module.exports = mongoose.model(
  "Allotment",
  allotmentSchema
);