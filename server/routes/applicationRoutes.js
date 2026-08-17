const express = require("express");

const {
  createApplication,
  getMyApplications,
  getMyApplicationById,
} = require("../controllers/applicationController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// APPLICANT ROUTES
// ==========================================

// Submit application
router.post(
  "/",
  protect,
  allowRoles("APPLICANT"),
  createApplication
);

// Get my applications
router.get(
  "/my",
  protect,
  allowRoles("APPLICANT"),
  getMyApplications
);

// Get single application
router.get(
  "/:applicationId",
  protect,
  allowRoles("APPLICANT"),
  getMyApplicationById
);

module.exports = router;