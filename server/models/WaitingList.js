
const mongoose = require("mongoose");

// ======================================================
// WAITING LIST / DISTRICT RANKING
// ======================================================
//
// A WaitingList document represents an applicant's position
// in the ranking for:
//
//      ONE HOUSING SCHEME
//              +
//      ONE DISTRICT
//
// Example:
//
// Anna Housing Scheme + Madurai
//
// 1. Kumar
// 2. Ravi
// 3. Priya
// 4. Arun
//
// Anna Housing Scheme + Chennai
//
// 1. Suresh
// 2. Banu
// 3. Mani
//
// Rankings are completely district-wise.
// There is NO state-level ranking.
//
// ======================================================

const waitingListSchema = new mongoose.Schema(
  {
    // ==================================================
    // APPLICANT
    // ==================================================

    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==================================================
    // APPLICATION
    // ==================================================
    //
    // One application can have only one waiting-list
    // ranking entry.
    //

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
      index: true,
    },

    // ==================================================
    // HOUSING SCHEME
    // ==================================================
    //
    // Ranking belongs to a particular housing scheme.
    //

    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HousingScheme",
      required: true,
      index: true,
    },

    // ==================================================
    // DISTRICT
    // ==================================================
    //
    // Ranking key:
    //
    //      schemeId + district
    //
    // Example:
    //
    // Anna Scheme + Madurai
    //
    // is completely separate from:
    //
    // Anna Scheme + Chennai
    //

    district: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ==================================================
    // RANKING POSITION
    // ==================================================
    //
    // District-wise ranking position.
    //
    // There is NO overall/state-level position.
    //
    // Example:
    //
    // Anna Scheme + Madurai
    //
    // Kumar = 1
    // Ravi  = 2
    // Priya = 3
    // Arun  = 4
    //
    // Ranking is recalculated by the waiting-list
    // controller whenever eligible applicants change.
    //

    districtPosition: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },

    // ==================================================
    // WAITING LIST STATUS
    // ==================================================
    //
    // ACTIVE
    // ----------------------------------------------
    // Applicant is currently participating in the
    // district ranking.
    //
    // REMOVED
    // ----------------------------------------------
    // Applicant is no longer participating in the
    // ranking.
    //
    // IMPORTANT:
    //
    // Waiting-list status is intentionally independent
    // from allotment status.
    //
    // An allotment offer uses:
    //
    //     Allotment.status = OFFERED
    //
    // The WaitingList entry does NOT become OFFERED.
    //
    // Allotment statuses are handled by Allotment.js:
    //
    // OFFERED
    // ACCEPTED
    // REJECTED
    // CANCELLED
    //

    status: {
      type: String,
      enum: ["ACTIVE", "REMOVED"],
      default: "ACTIVE",
      index: true,
    },

    // ==================================================
    // REMOVAL INFORMATION
    // ==================================================

    removedAt: {
      type: Date,
      default: null,
    },

    removalReason: {
      type: String,
      enum: [
        "ALLOTMENT_ACCEPTED",
        "ALLOTTED_FROM_OTHER_SCHEME",
        "APPLICATION_REJECTED",
        "APPLICATION_WITHDRAWN",
      ],
      default: null,
    },

    // ==================================================
    // LAST RANKING UPDATE
    // ==================================================

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// ======================================================
// UNIQUE RANKING ENTRY
// ======================================================
//
// An applicant can have only ONE ranking entry for:
//
//      Scheme + District
//
// Since one applicant can submit only one application
// for a scheme, this also protects against duplicate
// ranking records.
//

waitingListSchema.index(
  {
    applicantId: 1,
    schemeId: 1,
    district: 1,
  },
  {
    unique: true,
  },
);

// ======================================================
// SCHEME + DISTRICT RANKING INDEX
// ======================================================
//
// Main query:
//
// Find active rankings for:
//
//      Anna Scheme
//      +
//      Madurai
//
// ordered by district position.
//

waitingListSchema.index({
  schemeId: 1,
  district: 1,
  status: 1,
  districtPosition: 1,
});

// ======================================================
// APPLICANT ACTIVE RANKING INDEX
// ======================================================
//
// Useful when an applicant accepts an allotment.
//
// Example:
//
// Applicant Kumar accepts Anna Scheme.
//
// System can find all Kumar's active ranking entries
// and remove them.
//

waitingListSchema.index({
  applicantId: 1,
  status: 1,
});

// ======================================================
// MODEL
// ======================================================

module.exports = mongoose.model(
  "WaitingList",
  waitingListSchema,
);

