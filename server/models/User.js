const mongoose = require("mongoose");

// ======================================================
// USER SCHEMA
// ======================================================

const userSchema = new mongoose.Schema(
  {
    // ==================================================
    // BASIC DETAILS
    // ==================================================

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

    // ==================================================
    // ROLE
    // ==================================================

    role: {
      type: String,
      enum: [
        "APPLICANT",
        "OFFICER",
        "ADMIN",
      ],
      default: "APPLICANT",
      required: true,
      index: true,
    },

    // ==================================================
    // DISTRICT
    // ==================================================
    //
    // IMPORTANT:
    //
    // APPLICANT:
    //     District represents the applicant's registered
    //     residential district.
    //
    // OFFICER:
    //     District represents the district the officer
    //     is responsible for.
    //
    // ADMIN:
    //     District is normally not required.
    //
    // This field is the basis for district-level access.
    //

    district: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    // ==================================================
    // HOUSING STATUS
    // ==================================================
    //
    // APPLICANT ONLY
    //
    // NOT_ALLOTTED
    //     Applicant has not received a house.
    //
    // ALLOTTED
    //     Applicant has accepted a house.
    //
    // This prevents an applicant from receiving multiple
    // houses through different schemes.
    //

    housingStatus: {
      type: String,
      enum: [
        "NOT_ALLOTTED",
        "ALLOTTED",
      ],
      default: "NOT_ALLOTTED",
      index: true,
    },

    // ==================================================
    // ACCOUNT STATUS
    // ==================================================

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


// ======================================================
// INDEXES
// ======================================================

userSchema.index({
  role: 1,
  district: 1,
});


// ======================================================
// MODEL
// ======================================================

module.exports = mongoose.model(
  "User",
  userSchema
);