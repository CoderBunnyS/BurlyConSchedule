const express = require("express");
const router = express.Router();
const FlexibleShift = require("../models/FlexibleShift");


const {
  getUserFlexShifts,
  getAllFlexShifts,
  createFlexShift,
  signUpForFlexShift,
  cancelFlexShift,
  deleteFlexShift
} = require("../controllers/flexShiftController");

// Specific route first
router.get("/user/:userId", getUserFlexShifts);

// Public Routes
router.get("/", getAllFlexShifts);

// Volunteer Actions
router.post("/:id/signup", signUpForFlexShift);
router.post("/:id/cancel", cancelFlexShift);

// Admin Actions
router.post("/", createFlexShift);
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
