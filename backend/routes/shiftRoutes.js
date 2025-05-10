const express = require("express");
const router = express.Router();
const {
  getShifts,
  getShiftById,
  signUpForShift,
  cancelShift,
  getUserShifts,
  createShift,
  deleteShift
} = require("../controllers/volunteerController"); // still using volunteerController

// Specific route first to avoid conflict with "/:id"
router.get("/user/:userId", getUserShifts);

// Public Routes
router.get("/", getShifts);
router.get("/:id", getShiftById);

// Volunteer Actions
router.post("/:id/signup", signUpForShift);
router.post("/:id/cancel", cancelShift);

// Admin Actions
router.post("/", createShift);
router.delete("/:id", deleteShift);

module.exports = router;
