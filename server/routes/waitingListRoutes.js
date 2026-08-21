const express = require("express");

const {
  getMyWaitingLists,
  getOfficerWaitingList,
  addToWaitingList,
} = require("../controllers/waitingListController");

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
  getMyWaitingLists
);

// ==========================================
// OFFICER
// ==========================================

// View waiting list for officer's schemes
router.get(
  "/officer",
  protect,
  allowRoles("OFFICER"),
  getOfficerWaitingList
);

// Add eligible application to waiting list
router.post(
  "/:applicationId/add",
  protect,
  allowRoles("OFFICER"),
  addToWaitingList
);

module.exports = router;