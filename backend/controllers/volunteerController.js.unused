const Shift = require("../models/Shift");


// Get all shifts
exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find();
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's shifts
const User = require("../models/User");
const HourlyNeed = require("../models/HourlyNeed");

// Get user's hourly shifts 
exports.getUserShifts = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ fusionAuthId: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hourlyShiftIds = user.volunteerShifts
      .filter((entry) => entry.status === "registered")
      .map((entry) => entry.shift);

    const shifts = await HourlyNeed.find({ _id: { $in: hourlyShiftIds } });

    res.json({
      shifts,
      totalHours: shifts.length,
    });
  } catch (err) {
    console.error("Error loading user shifts:", err);
    res.status(500).json({ message: err.message });
  }
};


// Sign up for shift
exports.signUpForShift = async (req, res) => {
  const { userId } = req.body;

  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    const isAlreadySignedUp = shift.volunteersRegistered.some(
      (id) => id.toString() === userId
    );

    if (isAlreadySignedUp) {
      return res.status(400).json({ message: "Already signed up" });
    }

    if (shift.volunteersRegistered.length >= shift.volunteersNeeded) {
      return res.status(400).json({ message: "Shift is full" });
    }

    shift.volunteersRegistered.push(userId);
    await shift.save();

    res.json(shift);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Cancel shift
exports.cancelShift = async (req, res) => {
  const { userId } = req.body;
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    shift.volunteersRegistered = shift.volunteersRegistered.filter(id => id.toString() !== userId);
    await shift.save();

    res.json({ message: "Successfully canceled" });
  } catch (err) {
    console.error("Error cancelling shift:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get shift by ID
exports.getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }
    res.json(shift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Create new shift 
exports.createShift = async (req, res) => {
  try {
    const shift = new Shift(req.body);
    await shift.save();
    res.status(201).json(shift);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete shift
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });
    res.json({ message: "Shift deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
