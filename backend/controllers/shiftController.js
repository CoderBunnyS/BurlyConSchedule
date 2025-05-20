const Shift = require("../models/Shift");
const User = require("../models/User");

// CREATE a new shift
exports.createShift = async (req, res) => {
  const { date, startTime, endTime, role, taskDescription, volunteersNeeded, notes } = req.body;

  try {
    const newShift = new Shift({
      date,
      startTime,
      endTime,
      role,
      taskDescription,
      volunteersNeeded,
      notes
    });

    await newShift.save();
    res.status(201).json(newShift);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET all shifts (admin panel)
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().sort({ date: 1, startTime: 1 });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH: Update a shift
exports.updateShift = async (req, res) => {
  try {
    const updated = await Shift.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Shift not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// DELETE a shift
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });
    res.json({ message: "Shift deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all volunteers registered for a specific shift
exports.getShiftVolunteers = async (req, res) => {
  try {
    const users = await User.find({ "volunteerShifts.shift": req.params.id })
      .select("preferredName email volunteerShifts")
      .lean();

    const volunteers = users.map(user => {
      const entry = user.volunteerShifts.find(s => s.shift.toString() === req.params.id);
      return {
        _id: user._id,
        preferredName: user.preferredName,
        email: user.email,
        status: entry.status
      };
    });

    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// MARK a volunteer as no-show
exports.markNoShow = async (req, res) => {
  const { userId, shiftId } = req.body;

  try {
    const user = await User.findOne({ fusionAuthId: userId });

    const entry = user.volunteerShifts.find(s => s.shift.toString() === shiftId);

    if (!entry) {
      return res.status(404).json({ message: "Shift not found for this user" });
    }

    entry.status = "no-show";
    await user.save();

    res.json({ message: "Marked as no-show" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
