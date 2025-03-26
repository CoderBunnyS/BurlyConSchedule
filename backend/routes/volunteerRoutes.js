const express = require("express");
const router = express.Router();
const {
  getShifts,
  getShiftById,
  signUpForShift,
  cancelShift,
  getUserShifts,
  createShift,
  deleteShift,
} = require("../controllers/volunteerController");

// Public Routes
router.get("/", getShifts);
//router.get("/:id", getShiftById);

// Protected Routes (Auth Not Required Yet)
router.post("/:id/signup", signUpForShift);
router.post("/:id/cancel", cancelShift);
router.get("/user/:userId", getUserShifts); // Get shifts for a user

module.exports = router;
