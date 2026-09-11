const express = require("express");

const {
  getOfficerApplications,
  getOfficerApplicationById,
  verifyApplication,
} = require("../controllers/officerApplicationController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// OFFICER APPLICATION ROUTES
// ======================================================

// Get applications from officer's district
router.get(
  "/",
  protect,
  allowRoles("OFFICER"),
  getOfficerApplications
);

// Get single application from officer's district
router.get(
  "/:applicationId",
  protect,
  allowRoles("OFFICER"),
  getOfficerApplicationById
);

// Verify application
router.patch(
  "/:applicationId/verify",
  protect,
  allowRoles("OFFICER"),
  verifyApplication
);

module.exports = router;