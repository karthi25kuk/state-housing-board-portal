const express = require("express");

const {
  createScheme,
  getAllSchemes,
} = require("../controllers/adminController");

const {
  getOfficerSchemes,
  getOfficerSchemeById,
  updateSchemeDetails,
  getOpenSchemes,
  getSchemeById,
} = require("../controllers/housingSchemeController");

const protect =
  require("../middleware/authMiddleware");

const allowRoles =
  require("../middleware/roleMiddleware");

const router =
  express.Router();


// ======================================================
// ADMIN
// ======================================================

router.post(
  "/",
  protect,
  allowRoles("ADMIN"),
  createScheme
);

router.get(
  "/admin",
  protect,
  allowRoles("ADMIN"),
  getAllSchemes
);


// ======================================================
// APPLICANT
// ======================================================

router.get(
  "/open",
  protect,
  allowRoles("APPLICANT"),
  getOpenSchemes
);


// ======================================================
// OFFICER
// ======================================================

router.get(
  "/officer",
  protect,
  allowRoles("OFFICER"),
  getOfficerSchemes
);

router.get(
  "/officer/:schemeId",
  protect,
  allowRoles("OFFICER"),
  getOfficerSchemeById
);

router.patch(
  "/officer/:schemeId",
  protect,
  allowRoles("OFFICER"),
  updateSchemeDetails
);


// ======================================================
// GENERAL
// ======================================================

router.get(
  "/:schemeId",
  protect,
  allowRoles(
    "OFFICER",
    "APPLICANT",
    "ADMIN"
  ),
  getSchemeById
);


module.exports = router;