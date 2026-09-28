const Application = require("../models/Application");
const HousingScheme = require("../models/HousingScheme");
const User = require("../models/User");

// ======================================================
// GENERATE APPLICATION NUMBER
// ======================================================

const generateApplicationNumber = () => {
  const year = new Date().getFullYear();

  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `SHA-${year}-${randomNumber}`;
};

// ======================================================
// APPLY FOR HOUSING SCHEME
// ======================================================
//
// IMPORTANT WORKFLOW:
//
// Scheme is a STANDARD/common entity created by ADMIN.
//
// Applicant can apply even when their district has
// NO housing configuration yet.
//
// Workflow:
//
// Applicant
//     ↓
// Standard Housing Scheme
//     ↓
// Registered District Verification
//     ↓
// Scheme Eligibility Check
//     ↓
// Application Created
//     ↓
// SUBMITTED
//     ↓
// Officer verifies
//     ↓
// ELIGIBLE / REJECTED
//     ↓
// ELIGIBLE → WaitingList
//     ↓
// District ranking
//     ↓
// Officer configures housing
//     ↓
// Allotment based on ranking
//
// IMPORTANT:
//
// District configuration is NOT required to apply.
//
// District configuration is required later for
// allotment only.
// ======================================================

const createApplication = async (req, res) => {
  try {
    const applicantId = req.user.userId;

    const {
      schemeId,

      aadhaarNumber,
      dateOfBirth,
      gender,
      mobileNumber,

      address,
      district,
      state,
      pinCode,

      familyMembers,
      annualIncome,
      incomeCategory,
      employmentStatus,
      occupation,

      incomeCertificateUrl,
      aadhaarDocumentUrl,
      addressProofUrl,
    } = req.body;

    // ==================================================
    // VALIDATE REQUIRED FIELDS
    // ==================================================

    if (
      !schemeId ||
      !aadhaarNumber ||
      !dateOfBirth ||
      !gender ||
      !mobileNumber ||
      !address ||
      !district ||
      !state ||
      !pinCode ||
      familyMembers === undefined ||
      annualIncome === undefined ||
      !incomeCategory ||
      !employmentStatus ||
      !occupation ||
      !incomeCertificateUrl ||
      !aadhaarDocumentUrl ||
      !addressProofUrl
    ) {
      return res.status(400).json({
        message:
          "Please provide all required application details.",
      });
    }

    // ==================================================
    // GET APPLICANT
    // ==================================================

    const applicant =
      await User.findById(applicantId);

    if (!applicant) {
      return res.status(404).json({
        message: "Applicant not found.",
      });
    }

    // ==================================================
    // CHECK APPLICANT ROLE
    // ==================================================

    if (applicant.role !== "APPLICANT") {
      return res.status(403).json({
        message:
          "Only applicants can submit housing applications.",
      });
    }

    // ==================================================
    // CHECK ACCOUNT STATUS
    // ==================================================

    if (!applicant.isActive) {
      return res.status(403).json({
        message:
          "Your account is inactive. Please contact the administrator.",
      });
    }

    // ==================================================
    // CHECK HOUSING STATUS
    // ==================================================

    if (
      applicant.housingStatus ===
      "ALLOTTED"
    ) {
      return res.status(403).json({
        message:
          "You have already been allotted a house and cannot apply for another housing scheme.",
      });
    }

    // ==================================================
    // REGISTERED DISTRICT CHECK
    // ==================================================
    //
    // User.district is the source of truth.
    //
    // Applicant cannot submit an application for a
    // different district.
    //
    // ==================================================

    if (
      !applicant.district ||
      !applicant.district.trim()
    ) {
      return res.status(400).json({
        message:
          "Your registered district is missing. Please update your profile before applying.",
      });
    }

    const registeredDistrict =
      applicant.district.trim();

    const submittedDistrict =
      String(district).trim();

    if (
      registeredDistrict.toLowerCase() !==
      submittedDistrict.toLowerCase()
    ) {
      return res.status(400).json({
        message:
          "Application district must match your registered district.",
      });
    }

    // ==================================================
    // GET STANDARD HOUSING SCHEME
    // ==================================================

    const scheme =
      await HousingScheme.findById(
        schemeId
      );

    if (!scheme) {
      return res.status(404).json({
        message:
          "Housing scheme not found.",
      });
    }

    // ==================================================
    // IMPORTANT:
    //
    // DO NOT CHECK DISTRICT CONFIGURATION HERE.
    //
    // The scheme may have:
    //
    // configurations: []
    //
    // and the applicant must STILL be able to apply.
    //
    // Configuration is required only for allotment.
    //
    // ==================================================

    // ==================================================
    // CHECK DUPLICATE APPLICATION
    // ==================================================

    const existingApplication =
      await Application.findOne({
        applicantId,
        schemeId,
      });

    if (existingApplication) {
      return res.status(409).json({
        message:
          "You have already applied for this housing scheme.",
      });
    }

    // ==================================================
    // VALIDATE FAMILY MEMBERS
    // ==================================================

    const parsedFamilyMembers =
      Number(familyMembers);

    if (
      !Number.isInteger(
        parsedFamilyMembers
      ) ||
      parsedFamilyMembers < 1
    ) {
      return res.status(400).json({
        message:
          "Family members must be a positive whole number.",
      });
    }

    // ==================================================
    // VALIDATE ANNUAL INCOME
    // ==================================================

    const parsedAnnualIncome =
      Number(annualIncome);

    if (
      !Number.isFinite(
        parsedAnnualIncome
      ) ||
      parsedAnnualIncome < 0
    ) {
      return res.status(400).json({
        message:
          "Annual income must be a valid non-negative number.",
      });
    }

    // ==================================================
    // VALIDATE INCOME CATEGORY
    // ==================================================

    const allowedIncomeCategories = [
      "EWS",
      "LIG",
      "MIG",
      "HIG",
    ];

    const normalizedIncomeCategory =
      String(incomeCategory)
        .trim()
        .toUpperCase();

    if (
      !allowedIncomeCategories.includes(
        normalizedIncomeCategory
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid income category.",
      });
    }

    // ==================================================
    // CHECK SCHEME ELIGIBLE CATEGORY
    // ==================================================

    if (
      !scheme.eligibleIncomeCategories.includes(
        normalizedIncomeCategory
      )
    ) {
      return res.status(400).json({
        message:
          `Your income category (${normalizedIncomeCategory}) ` +
          "is not eligible for this housing scheme.",
      });
    }

    // ==================================================
    // CHECK MAXIMUM ANNUAL INCOME
    // ==================================================

    if (
      parsedAnnualIncome >
      Number(
        scheme.maximumAnnualIncome
      )
    ) {
      return res.status(400).json({
        message:
          "Your annual income exceeds the maximum income limit for this housing scheme.",
      });
    }

    // ==================================================
    // VALIDATE GENDER
    // ==================================================

    const normalizedGender =
      String(gender)
        .trim()
        .toUpperCase();

    const allowedGenders = [
      "MALE",
      "FEMALE",
      "OTHER",
    ];

    if (
      !allowedGenders.includes(
        normalizedGender
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid gender value.",
      });
    }

    // ==================================================
    // VALIDATE EMPLOYMENT STATUS
    // ==================================================

    const normalizedEmploymentStatus =
      String(employmentStatus)
        .trim()
        .toUpperCase();

    const allowedEmploymentStatuses = [
      "EMPLOYED",
      "SELF_EMPLOYED",
      "UNEMPLOYED",
      "RETIRED",
      "OTHER",
    ];

    if (
      !allowedEmploymentStatuses.includes(
        normalizedEmploymentStatus
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid employment status.",
      });
    }

    // ==================================================
    // VALIDATE AADHAAR
    // ==================================================

    const cleanAadhaar =
      String(aadhaarNumber).trim();

    if (
      !/^\d{12}$/.test(
        cleanAadhaar
      )
    ) {
      return res.status(400).json({
        message:
          "Aadhaar number must contain exactly 12 digits.",
      });
    }

    // ==================================================
    // VALIDATE MOBILE NUMBER
    // ==================================================

    const cleanMobile =
      String(mobileNumber).trim();

    if (
      !/^[6-9]\d{9}$/.test(
        cleanMobile
      )
    ) {
      return res.status(400).json({
        message:
          "Please enter a valid 10-digit Indian mobile number.",
      });
    }

    // ==================================================
    // VALIDATE PIN CODE
    // ==================================================

    const cleanPinCode =
      String(pinCode).trim();

    if (
      !/^\d{6}$/.test(
        cleanPinCode
      )
    ) {
      return res.status(400).json({
        message:
          "PIN code must contain exactly 6 digits.",
      });
    }

    // ==================================================
    // VALIDATE DATE OF BIRTH
    // ==================================================

    const parsedDateOfBirth =
      new Date(dateOfBirth);

    if (
      Number.isNaN(
        parsedDateOfBirth.getTime()
      )
    ) {
      return res.status(400).json({
        message:
          "Please provide a valid date of birth.",
      });
    }

    if (
      parsedDateOfBirth >= new Date()
    ) {
      return res.status(400).json({
        message:
          "Date of birth must be in the past.",
      });
    }

    // ==================================================
    // VALIDATE TEXT FIELDS
    // ==================================================

    const cleanAddress =
      String(address).trim();

    const cleanState =
      String(state).trim();

    const cleanOccupation =
      String(occupation).trim();

    const cleanIncomeCertificateUrl =
      String(
        incomeCertificateUrl
      ).trim();

    const cleanAadhaarDocumentUrl =
      String(
        aadhaarDocumentUrl
      ).trim();

    const cleanAddressProofUrl =
      String(
        addressProofUrl
      ).trim();

    if (
      !cleanAddress ||
      !cleanState ||
      !cleanOccupation
    ) {
      return res.status(400).json({
        message:
          "Address, state and occupation cannot be empty.",
      });
    }

    if (
      !cleanIncomeCertificateUrl ||
      !cleanAadhaarDocumentUrl ||
      !cleanAddressProofUrl
    ) {
      return res.status(400).json({
        message:
          "Required document references cannot be empty.",
      });
    }

    // ==================================================
    // CREATE APPLICATION
    // ==================================================

    const application =
      await Application.create({
        applicationNumber:
          generateApplicationNumber(),

        applicantId,

        schemeId,

        // ----------------------------------------------
        // APPLICANT SNAPSHOT
        // ----------------------------------------------

        aadhaarNumber:
          cleanAadhaar,

        dateOfBirth:
          parsedDateOfBirth,

        gender:
          normalizedGender,

        mobileNumber:
          cleanMobile,

        address:
          cleanAddress,

        // IMPORTANT:
        // Always store the verified registered district.
        district:
          registeredDistrict,

        state:
          cleanState,

        pinCode:
          cleanPinCode,

        // ----------------------------------------------
        // FAMILY / INCOME
        // ----------------------------------------------

        familyMembers:
          parsedFamilyMembers,

        annualIncome:
          parsedAnnualIncome,

        incomeCategory:
          normalizedIncomeCategory,

        employmentStatus:
          normalizedEmploymentStatus,

        occupation:
          cleanOccupation,

        // ----------------------------------------------
        // DOCUMENTS
        // ----------------------------------------------

        incomeCertificateUrl:
          cleanIncomeCertificateUrl,

        aadhaarDocumentUrl:
          cleanAadhaarDocumentUrl,

        addressProofUrl:
          cleanAddressProofUrl,

        // ----------------------------------------------
        // STATUS
        // ----------------------------------------------

        status:
          "SUBMITTED",

        submittedAt:
          new Date(),
      });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      message:
        "Housing scheme application submitted successfully.",

      application,
    });
  } catch (error) {
    console.error(
      "Create application error:",
      error
    );

    // ==================================================
    // DUPLICATE APPLICATION
    // ==================================================

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        message:
          "You have already applied for this housing scheme.",
      });
    }

    // ==================================================
    // VALIDATION ERROR
    // ==================================================

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        message:
          error.message ||
          "Invalid application data.",
      });
    }

    // ==================================================
    // SERVER ERROR
    // ==================================================

    return res.status(500).json({
      message:
        "Server error while submitting application.",
    });
  }
};

// ======================================================
// GET MY APPLICATIONS
// ======================================================

const getMyApplications = async (
  req,
  res
) => {
  try {
    const applicantId =
      req.user.userId;

    const applications =
      await Application.find({
        applicantId,
      })
        .populate(
          "schemeId",
          `
          schemeName
          description
          eligibleIncomeCategories
          maximumAnnualIncome
          houseModel
          price
          configurations
          createdBy
          `
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      applications,
    });
  } catch (error) {
    console.error(
      "Get my applications error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching applications.",
    });
  }
};

// ======================================================
// GET SINGLE APPLICATION
// ======================================================

const getMyApplicationById = async (
  req,
  res
) => {
  try {
    const applicantId =
      req.user.userId;

    const {
      applicationId,
    } = req.params;

    const application =
      await Application.findOne({
        _id: applicationId,
        applicantId,
      }).populate(
        "schemeId",
        `
        schemeName
        description
        eligibleIncomeCategories
        maximumAnnualIncome
        houseModel
        price
        configurations
        createdBy
        `
      );

    if (!application) {
      return res.status(404).json({
        message:
          "Application not found.",
      });
    }

    return res.status(200).json({
      application,
    });
  } catch (error) {
    console.error(
      "Get my application error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching application.",
    });
  }
};

// ======================================================
// WITHDRAW APPLICATION
// ======================================================
//
// Applicant can withdraw:
//
// SUBMITTED
// UNDER_VERIFICATION
// ELIGIBLE
//
// After withdrawal:
//
// Application → WITHDRAWN
//
// The waiting-list controller/workflow should remove
// any ACTIVE waiting-list entry associated with this
// application.
// ======================================================

const withdrawApplication = async (
  req,
  res
) => {
  try {
    const applicantId =
      req.user.userId;

    const {
      applicationId,
    } = req.params;

    const application =
      await Application.findOne({
        _id: applicationId,
        applicantId,
      });

    if (!application) {
      return res.status(404).json({
        message:
          "Application not found.",
      });
    }

    // ==================================================
    // STATUS CHECK
    // ==================================================

    if (
      ![
        "SUBMITTED",
        "UNDER_VERIFICATION",
        "ELIGIBLE",
      ].includes(
        application.status
      )
    ) {
      return res.status(400).json({
        message:
          "This application cannot be withdrawn in its current status.",
      });
    }

    // ==================================================
    // UPDATE
    // ==================================================

    application.status =
      "WITHDRAWN";

    await application.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      message:
        "Housing application withdrawn successfully.",

      application,
    });
  } catch (error) {
    console.error(
      "Withdraw application error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while withdrawing application.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createApplication,
  getMyApplications,
  getMyApplicationById,
  withdrawApplication,
};