const express = require("express");
const router = express.Router();
const {
  getEstablishedClubs,
  getClubDetailForCTSV,
  getClubMembers,
} = require("../controllers/ctsvClubController");
const { auth, authorizeRole } = require("../middleware/auth");

const ctsvOnly = [auth, authorizeRole(["CTSV"])];

router.get("/established", ...ctsvOnly, getEstablishedClubs);
router.get("/:id/detail", ...ctsvOnly, getClubDetailForCTSV);
router.get("/:id/members", ...ctsvOnly, getClubMembers);

module.exports = router;
