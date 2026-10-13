const express = require("express");

const {
  createAllotment,
  getOfficerAllotments,
  getMyAllotments,
  respondToAllotment,
  getEligibleApplicantsForAllotment,
  downloadAllotmentCopy,
} = require("../controllers/allotmentController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// APPLICANT
// ======================================================

router.get(
  "/my",
  protect,
  allowRoles("APPLICANT"),
  getMyAllotments
);

router.get(
  "/:allotmentId/download",
  protect,
  allowRoles("APPLICANT"),
  downloadAllotmentCopy
);

// ======================================================
// OFFICER
// ======================================================

router.post(
  "/",
  protect,
  allowRoles("OFFICER"),
  createAllotment
);

router.get(
  "/officer",
  protect,
  allowRoles("OFFICER"),
  getOfficerAllotments
);

// Fetch eligible applicants for a selected configuration
router.get(
  "/configurations/:configurationId/applicants",
  protect,
  allowRoles("OFFICER"),
  getEligibleApplicantsForAllotment
);

// ======================================================
// APPLICANT RESPONSE
// ======================================================

router.patch(
  "/:allotmentId/respond",
  protect,
  allowRoles("APPLICANT"),
  respondToAllotment
);

module.exports = router;
