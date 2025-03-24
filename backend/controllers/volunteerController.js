const Shift = require("../models/Shift");

// Get all shifts (Admin Panel)
exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find();
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a user's shifts (Profile Page)
exports.getUserShifts = async (req, res) => {
  const { userId } = req.params;
  try {
    const shifts = await Shift.find({ volunteersRegistered: userId });
    const totalHours = shifts.length * 4; // Assuming 4-hour shifts
    res.json({ shifts, totalHours });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Sign up for a shift
exports.signUpForShift = async (req, res) => {
  const { userId } = req.body; // Future auth
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    if (shift.availableSpots <= 0 || shift.volunteersRegistered.includes(userId)) {
      return res.status(400).json({ message: "Shift full or already signed up" });
    }

    shift.availableSpots -= 1;
    shift.volunteersRegistered.push(userId);
    await shift.save();

    res.json({ message: "Successfully registered!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel shift
exports.cancelShift = async (req, res) => {
  const { userId } = req.body; // Future auth
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    shift.availableSpots += 1;
    shift.volunteersRegistered = shift.volunteersRegistered.filter(id => id !== userId);
    await shift.save();

    res.json({ message: "Successfully canceled!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
