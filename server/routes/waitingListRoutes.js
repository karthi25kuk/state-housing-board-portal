const express = require("express");

const {
  getMyWaitingLists,
  getOfficerWaitingList,
  generateRanking,
  approveRanking,
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

// Generate the waiting-list ranking after the application period closes
router.post(
  "/:schemeId/generate",
  protect,
  allowRoles("OFFICER"),
  generateRanking
);

// Approve the generated waiting-list ranking
router.patch(
  "/:schemeId/approve",
  protect,
  allowRoles("OFFICER"),
  approveRanking
);

module.exports = router;