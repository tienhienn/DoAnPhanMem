const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getResources,
  getTransactions,
  createTransaction,
  getBorrowings,
  createBorrowing,
  returnEquipment,
} = require("../controllers/financeLogisticsController");

router.get("/resources", auth, getResources);
router.get("/transactions", auth, getTransactions);
router.post("/transactions", auth, createTransaction);
router.get("/borrowings", auth, getBorrowings);
router.post("/borrowings", auth, createBorrowing);
router.patch("/borrowings/:id/return", auth, returnEquipment);

module.exports = router;
