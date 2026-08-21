const express = require("express");

const {
  createAllotment,
  getOfficerAllotments,
  getMyAllotments,
  respondToAllotment,
} = require("../controllers/allotmentController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// APPLICANT
// ==========================================

router.get(
  "/my",
  protect,
  allowRoles("APPLICANT"),
  getMyAllotments
);

// ==========================================
// OFFICER
// ==========================================

// Create allotment offer
router.post(
  "/",
  protect,
  allowRoles("OFFICER"),
  createAllotment
);

// View officer allotments
router.get(
  "/officer",
  protect,
  allowRoles("OFFICER"),
  getOfficerAllotments
);


// ==========================================
// APPLICANT - ACCEPT / REJECT ALLOTMENT
// ==========================================

router.patch(
  "/:allotmentId/respond",
  protect,
  allowRoles("APPLICANT"),
  respondToAllotment
);

module.exports = router;