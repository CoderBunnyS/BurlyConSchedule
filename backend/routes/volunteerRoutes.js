const express = require("express");
const router = express.Router();
const { getShifts, getShiftById, signUpForShift, cancelShift, checkInShift, checkOutShift, createShift, deleteShift } = require("../controllers/volunteerController");

// Public Routes
router.get("/", getShifts);
router.get("/:id", getShiftById);

// Protected Routes (Require Authentication)
router.post("/:id/signup", signUpForShift);
router.post("/:id/cancel", cancelShift);
router.patch("/:id/checkin", checkInShift);
router.patch("/:id/checkout", checkOutShift);

// Admin-Only Routes
router.post("/", createShift);
router.delete("/:id", deleteShift);

module.exports = router;
