const express = require("express");

const {
  createScheme,
  createOfficer,
  getAdminDashboard,
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
// CREATE HOUSING SCHEME
// ======================================================

router.post(
  "/schemes",
  protect,
  allowRoles("ADMIN"),
  createScheme
);

// ======================================================
// CREATE OFFICER
// ======================================================

router.post(
  "/officers",
  protect,
  allowRoles("ADMIN"),
  createOfficer
);

module.exports = router;