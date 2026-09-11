const express = require("express");

const {
  createScheme,
  getAllSchemes,
  createOfficer,
  getAdminDashboard,
  getAllOfficers,
  updateOfficerStatus,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// ADMIN DASHBOARD
// ======================================================

router.get(
  "/dashboard",
  protect,
  allowRoles("ADMIN"),
  getAdminDashboard
);

// ======================================================
// HOUSING SCHEMES
// ======================================================

router.post(
  "/schemes",
  protect,
  allowRoles("ADMIN"),
  createScheme
);

router.get(
  "/schemes",
  protect,
  allowRoles("ADMIN"),
  getAllSchemes
);

// ======================================================
// OFFICERS
// ======================================================

router.post(
  "/officers",
  protect,
  allowRoles("ADMIN"),
  createOfficer
);

router.get(
  "/officers",
  protect,
  allowRoles("ADMIN"),
  getAllOfficers
);

router.patch(
  "/officers/:officerId/status",
  protect,
  allowRoles("ADMIN"),
  updateOfficerStatus
);

module.exports = router;