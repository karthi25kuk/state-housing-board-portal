const express = require("express");

const {
  createScheme,
  getOpenSchemes,
  getOfficerSchemes,
  openScheme,
  getSchemeById,
} = require("../controllers/schemeController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// APPLICANT
// ==========================================

// View open housing schemes
router.get(
  "/open",
  protect,
  allowRoles("APPLICANT"),
  getOpenSchemes
);


// ==========================================
// OFFICER
// ==========================================

// Create scheme
router.post(
  "/",
  protect,
  allowRoles("OFFICER"),
  createScheme
);

// View schemes created by logged-in officer
router.get(
  "/officer",
  protect,
  allowRoles("OFFICER"),
  getOfficerSchemes
);

// Officer opens scheme for applications
router.patch(
  "/:schemeId/open",
  protect,
  allowRoles("OFFICER"),
  openScheme
);

// View single scheme
router.get(
  "/:schemeId",
  protect,
  allowRoles("OFFICER", "APPLICANT"),
  getSchemeById
);



module.exports = router;