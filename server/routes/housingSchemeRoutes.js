const express = require("express");

const {
  createScheme,
  getAllSchemes,
} = require("../controllers/adminController");

const {
  getOfficerSchemes,
  getOfficerSchemeById,
  updateSchemeDetails,
  openScheme,
  getOpenSchemes,
  getSchemeById,
} = require("../controllers/housingSchemeController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// ADMIN
// ======================================================

// Create housing scheme
router.post(
  "/",
  protect,
  allowRoles("ADMIN"),
  createScheme
);

// Get all housing schemes
router.get(
  "/admin",
  protect,
  allowRoles("ADMIN"),
  getAllSchemes
);

// ======================================================
// APPLICANT
// ======================================================

// View currently open schemes
router.get(
  "/open",
  protect,
  allowRoles("APPLICANT"),
  getOpenSchemes
);

// ======================================================
// OFFICER
// ======================================================

// View all schemes
router.get(
  "/officer",
  protect,
  allowRoles("OFFICER"),
  getOfficerSchemes
);

// View one scheme
router.get(
  "/officer/:schemeId",
  protect,
  allowRoles("OFFICER"),
  getOfficerSchemeById
);

// Configure operational details
router.patch(
  "/officer/:schemeId",
  protect,
  allowRoles("OFFICER"),
  updateSchemeDetails
);

// Open / publish scheme
router.patch(
  "/officer/:schemeId/open",
  protect,
  allowRoles("OFFICER"),
  openScheme
);

// ======================================================
// GENERAL SCHEME DETAILS
// ======================================================

router.get(
  "/:schemeId",
  protect,
  allowRoles("OFFICER", "APPLICANT", "ADMIN"),
  getSchemeById
);

module.exports = router;