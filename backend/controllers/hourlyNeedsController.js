const HourlyNeed = require("../models/HourlyNeed");
const User = require("../models/User"); // 

// GET all hourly needs for date
exports.getHourlyNeedsByDate = async (req, res) => {
  try {
    const needs = await HourlyNeed.find({ date: req.params.date });
    res.json(needs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST bulk needs for date
exports.saveBulkHourlyNeeds = async (req, res) => {
  const { date, needs } = req.body;

  console.log("💾 Incoming hourly needs:", { date, needs });

  try {
    await HourlyNeed.deleteMany({ date }); 
    await HourlyNeed.insertMany(needs.map(n => ({ ...n, date }))); 
    res.status(200).json({ message: "Hourly needs saved." });
  } catch (err) {
    console.error("❌ Error saving hourly needs:", err);
    res.status(400).json({ error: err.message });
  }
};

exports.signUpForHourlyNeed = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  try {
    const need = await HourlyNeed.findById(id);
    if (!need) return res.status(404).json({ message: "Need not found" });
    if (need.volunteersNeeded <= 0) return res.status(400).json({ message: "No more volunteers needed" });

    const user = await User.findOne({ fusionAuthId: userId });

    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("👤 VolunteerShifts before check:", user.volunteerShifts);

    const alreadySignedUp = Array.isArray(user.volunteerShifts) && user.volunteerShifts.some(s => {
      const shiftId = s?.shift?._id || s?.shift;
      return shiftId?.toString?.() === id;
    });

    if (alreadySignedUp) return res.status(400).json({ message: "Already signed up" });

    // Save to user
    user.volunteerShifts.push({ shift: id, status: "registered" });
    user.totalHours += 1;
    await user.save();

    // Decrement remaining needed count
    need.volunteersNeeded -= 1;
    await need.save();

    res.json({ message: "Signed up", need });
  } catch (err) {
    console.error("🔥 Signup Error:", err);
    res.status(500).json({ message: err.message });
  }
};


// Cancel a need and update user
exports.cancelHourlyNeed = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  try {
    const need = await HourlyNeed.findById(id);
    if (!need) return res.status(404).json({ message: "Need not found" });

    const user = await User.findOne({ fusionAuthId: userId });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove shift from the user
    const before = user.volunteerShifts.length;
    user.volunteerShifts = user.volunteerShifts.filter(s => s.shift.toString() !== id);
    const after = user.volunteerShifts.length;

    // Only update hours if shift was removed
    if (after < before) {
      user.totalHours = Math.max(user.totalHours - 1, 0);
      await user.save();
    }

    need.volunteersNeeded += 1;
    await need.save();

    res.json({ message: "Cancelled successfully", need });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// GET all shifts for user
exports.getUserHourlyNeeds = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("volunteerShifts.shift");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Pull populated hourly needs
    const shifts = user.volunteerShifts
      .filter((s) => s.status === "registered")
      .map((s) => s.shift);

    res.json({ shifts, totalHours: user.totalHours });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
