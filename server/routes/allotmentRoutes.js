const express = require("express");

const {
  createAllotment,
  getOfficerAllotments,
  getMyAllotments,
  respondToAllotment,
} = require("../controllers/allotmentController");

const protect =
  require("../middleware/authMiddleware");

const allowRoles =
  require("../middleware/roleMiddleware");

const router =
  express.Router();


// ======================================================
// APPLICANT
// ======================================================

router.get(
  "/my",
  protect,
  allowRoles("APPLICANT"),
  getMyAllotments
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