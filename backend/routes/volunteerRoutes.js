const express = require("express");
const router = express.Router();
const FlexibleShift = require("../models/FlexibleShift");


const {
  getUserFlexShifts,
  getAllFlexShifts,
  getShiftsByDate,
  createFlexShift,
  signUpForFlexShift,
  cancelFlexShift,
  deleteFlexShift,
  updateFlexShift
} = require("../controllers/flexShiftController");

// Get user's shifts
router.get("/user/:userId", getUserFlexShifts);

// Get shifts by date
router.get("/:date", getShiftsByDate);

// Public Routes
router.get("/", getAllFlexShifts);

// Volunteer Actions
router.post("/:id/signup", signUpForFlexShift);
router.post("/:id/cancel", cancelFlexShift);

// Admin Actions
router.post("/", createFlexShift);
router.patch("/:id", updateFlexShift);
router.delete("/:id", deleteFlexShift);

router.post("/seed", async (req, res) => {
  try {
    const testShift = await FlexibleShift.create({
      role: "Hospitality",
      date: "2025-11-07",
      startTime: "10:00",
      endTime: "12:00",
      volunteersNeeded: 3,
      volunteersRegistered: [],
      notes: "Seeded for testing"
    });
    res.json(testShift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
