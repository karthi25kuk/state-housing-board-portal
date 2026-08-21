const express = require("express");

const {
  getOfficerApplications,
  getOfficerApplicationById,
  verifyApplication,
} = require("../controllers/officerApplicationController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// OFFICER APPLICATION ROUTES
// ==========================================

// Get applications for officer's schemes
router.get(
  "/",
  protect,
  allowRoles("OFFICER"),
  getOfficerApplications
);

// Get single application
router.get(
  "/:applicationId",
  protect,
  allowRoles("OFFICER"),
  getOfficerApplicationById
);

// ==========================================
// VERIFY APPLICATION
// ==========================================

router.patch(
  "/:applicationId/verify",
  protect,
  allowRoles("OFFICER"),
  verifyApplication
);

module.exports = router;