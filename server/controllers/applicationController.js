const Application = require("../models/Application");
const HousingScheme = require("../models/HousingScheme");
const User = require("../models/User");

// ==========================================
// GENERATE APPLICATION NUMBER
// ==========================================

const generateApplicationNumber = () => {
  const year = new Date().getFullYear();

  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `SHA-${year}-${randomNumber}`;
};


// ==========================================
// APPLY FOR HOUSING SCHEME
// ==========================================
// Applicant can apply only when:
// 1. Scheme exists
// 2. Scheme is OPEN
// 3. Current date is within application period
// 4. Applicant has not already applied
// 5. Applicant is eligible based on
//    scheme income category and maximum income
// 6. Applicant has not already been allotted a house
//
// Scheme details such as:
// - Scheme name
// - Description
// - Income category
// - Maximum income
// - House model
// - House price
//
// CANNOT be changed by the applicant.

const createApplication = async (req, res) => {
  try {
    const applicantId = req.user.userId;

    const {
      schemeId,

      // Applicant official details
      aadhaarNumber,
      dateOfBirth,
      gender,
      mobileNumber,

      // Address
      address,
      district,
      state,
      pinCode,

      // Family & income
      familyMembers,
      annualIncome,
      incomeCategory,
      employmentStatus,
      occupation,

      // Documents
      incomeCertificateUrl,
      aadhaarDocumentUrl,
      addressProofUrl,
    } = req.body;

    // ==========================================
    // VALIDATE REQUIRED FIELDS
    // ==========================================

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

    // ==========================================
    // GET APPLICANT
    // ==========================================

    const applicant = await User.findById(applicantId);

    if (!applicant) {
      return res.status(404).json({
        message: "Applicant not found.",
      });
    }

    // ==========================================
    // CHECK EXISTING ALLOTMENT
    // ==========================================
    // Applicant who already received a house
    // cannot apply for another scheme.

    if (applicant.housingStatus === "ALLOTTED") {
      return res.status(403).json({
        message:
          "You have already been allotted a house and cannot apply for another housing scheme.",
      });
    }

    // ==========================================
    // GET HOUSING SCHEME
    // ==========================================

    const scheme = await HousingScheme.findById(
      schemeId
    );

    if (!scheme) {
      return res.status(404).json({
        message: "Housing scheme not found.",
      });
    }

    // ==========================================
    // SCHEME MUST BE OPEN
    // ==========================================

    if (scheme.status !== "OPEN") {
      return res.status(400).json({
        message:
          "Applications are currently not open for this scheme.",
      });
    }

    // ==========================================
    // CHECK APPLICATION PERIOD
    // ==========================================

    const now = new Date();

    if (
      now < new Date(scheme.applicationStartDate)
    ) {
      return res.status(400).json({
        message:
          "Applications for this scheme have not started yet.",
      });
    }

    if (
      now > new Date(scheme.applicationEndDate)
    ) {
      return res.status(400).json({
        message:
          "The application period for this scheme has ended.",
      });
    }

    // ==========================================
    // CHECK DUPLICATE APPLICATION
    // ==========================================

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

    // ==========================================
    // VALIDATE FAMILY MEMBERS
    // ==========================================

    if (
      !Number.isInteger(Number(familyMembers)) ||
      Number(familyMembers) < 1
    ) {
      return res.status(400).json({
        message:
          "Family members must be a positive whole number.",
      });
    }

    // ==========================================
    // VALIDATE ANNUAL INCOME
    // ==========================================

    if (Number(annualIncome) < 0) {
      return res.status(400).json({
        message:
          "Annual income cannot be negative.",
      });
    }

    // ==========================================
    // CHECK INCOME CATEGORY ELIGIBILITY
    // ==========================================
    // Eligibility comes from the ADMIN-CREATED
    // fixed housing scheme.

    const eligibleCategories =
      scheme.eligibleIncomeCategories || [];

    if (
      !eligibleCategories.includes(
        incomeCategory
      )
    ) {
      return res.status(400).json({
        message:
          `Your income category (${incomeCategory}) is not eligible for this housing scheme.`,
      });
    }

    // ==========================================
    // CHECK MAXIMUM ANNUAL INCOME
    // ==========================================

    if (
      Number(annualIncome) >
      Number(scheme.maximumAnnualIncome)
    ) {
      return res.status(400).json({
        message:
          "Your annual income exceeds the maximum income limit for this housing scheme.",
      });
    }

    // ==========================================
    // VALIDATE AADHAAR
    // ==========================================

    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        message:
          "Aadhaar number must contain exactly 12 digits.",
      });
    }

    // ==========================================
    // VALIDATE MOBILE NUMBER
    // ==========================================

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      return res.status(400).json({
        message:
          "Please enter a valid 10-digit mobile number.",
      });
    }

    // ==========================================
    // VALIDATE PIN CODE
    // ==========================================

    if (!/^\d{6}$/.test(pinCode)) {
      return res.status(400).json({
        message:
          "PIN code must contain exactly 6 digits.",
      });
    }

    // ==========================================
    // CREATE APPLICATION
    // ==========================================

    const application =
      await Application.create({
        applicationNumber:
          generateApplicationNumber(),

        applicantId,

        schemeId,

        // ------------------------------------------
        // Applicant official details
        // ------------------------------------------

        aadhaarNumber,

        dateOfBirth,

        gender,

        mobileNumber,

        // ------------------------------------------
        // Address
        // ------------------------------------------

        address,

        district,

        state,

        pinCode,

        // ------------------------------------------
        // Family & income
        // ------------------------------------------

        familyMembers:
          Number(familyMembers),

        annualIncome:
          Number(annualIncome),

        incomeCategory,

        employmentStatus,

        occupation,

        // ------------------------------------------
        // Documents
        // ------------------------------------------

        incomeCertificateUrl,

        aadhaarDocumentUrl,

        addressProofUrl,

        // ------------------------------------------
        // Initial status
        // ------------------------------------------
        // Officer will later verify this application.

        status: "SUBMITTED",

        submittedAt: new Date(),
      });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(201).json({
      message:
        "Housing scheme application submitted successfully.",

      application,
    });
  } catch (error) {
    console.error(
      "Create application error:",
      error
    );

    // ==========================================
    // DUPLICATE APPLICATION
    // ==========================================

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "You have already applied for this scheme.",
      });
    }

    res.status(500).json({
      message:
        "Server error while submitting application.",
    });
  }
};


// ==========================================
// GET MY APPLICATIONS
// ==========================================
// Applicant can see all applications submitted
// by them.
//
// This also allows the frontend to show:
// SUBMITTED
// ELIGIBLE
// REJECTED
// WAITING_LIST
// ALLOTMENT_OFFERED
// ALLOTTED
// etc.

const getMyApplications = async (req, res) => {
  try {
    const applicantId = req.user.userId;

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
          location
          totalUnits
          availableUnits
          applicationStartDate
          applicationEndDate
          status
          `
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      applications,
    });
  } catch (error) {
    console.error(
      "Get my applications error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching applications.",
    });
  }
};


// ==========================================
// GET SINGLE APPLICATION
// ==========================================
// Applicant can view only their own application.

const getMyApplicationById = async (
  req,
  res
) => {
  try {
    const applicantId = req.user.userId;

    const { applicationId } = req.params;

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
        location
        totalUnits
        availableUnits
        applicationStartDate
        applicationEndDate
        status
        `
      );

    if (!application) {
      return res.status(404).json({
        message:
          "Application not found.",
      });
    }

    res.status(200).json({
      application,
    });
  } catch (error) {
    console.error(
      "Get my application error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching application.",
    });
  }
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  createApplication,
  getMyApplications,
  getMyApplicationById,
};