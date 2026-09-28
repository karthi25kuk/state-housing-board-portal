const express = require("express");

const {
  getMyWaitingLists,
  getOfficerWaitingList,
  generateRanking,
  approveRanking,
} = require("../controllers/waitingListController");

const protect =
  require("../middleware/authMiddleware");

const allowRoles =
  require("../middleware/roleMiddleware");

const router =
  express.Router();


// Applicant
router.get(
  "/my",
  protect,
  allowRoles("APPLICANT"),
  getMyWaitingLists
);


// Officer
router.get(
  "/officer",
  protect,
  allowRoles("OFFICER"),
  getOfficerWaitingList
);


// Generate ranking
router.post(
  "/:schemeId/generate",
  protect,
  allowRoles("OFFICER"),
  generateRanking
);


// Approve ranking
router.patch(
  "/:schemeId/approve",
  protect,
  allowRoles("OFFICER"),
  approveRanking
);


module.exports = router;