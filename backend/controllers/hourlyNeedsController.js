const HourlyNeed = require("../models/HourlyNeed");
const User = require("../models/User");
const { getActiveEvent } = require("../utils/getActiveEvent");

// GET all hourly needs for date (active event only)
exports.getHourlyNeedsByDate = async (req, res) => {
  try {
    const activeEvent = await getActiveEvent();
    const query = activeEvent
      ? { date: req.params.date, eventId: activeEvent._id }
      : { date: req.params.date };

    const needs = await HourlyNeed.find(query);
    res.json(needs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST bulk needs for date (auto-tag with active event)
exports.saveBulkHourlyNeeds = async (req, res) => {
  const { date, needs } = req.body;
  console.log("💾 Incoming hourly needs:", { date, needs });

  try {
    const activeEvent = await getActiveEvent();
    if (!activeEvent) {
      return res.status(400).json({ error: "No active event configured" });
    }

    // Only delete needs for this date AND this event
    await HourlyNeed.deleteMany({ date, eventId: activeEvent._id });
    await HourlyNeed.insertMany(
      needs.map(n => ({ ...n, date, eventId: activeEvent._id }))
    );
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

    user.volunteerShifts.push({ shift: id, refModel: "HourlyNeed", status: "registered" });
    user.totalHours += 1;
    await user.save();

    need.volunteersNeeded -= 1;
    await need.save();

    res.json({ message: "Signed up", need });
  } catch (err) {
    console.error("🔥 Signup Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.cancelHourlyNeed = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  try {
    const need = await HourlyNeed.findById(id);
    if (!need) return res.status(404).json({ message: "Need not found" });

    const user = await User.findOne({ fusionAuthId: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const before = user.volunteerShifts.length;
    user.volunteerShifts = user.volunteerShifts.filter(s => s.shift.toString() !== id);
    const after = user.volunteerShifts.length;

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

exports.getUserHourlyNeeds = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("volunteerShifts.shift");
    if (!user) return res.status(404).json({ message: "User not found" });

    const activeEvent = await getActiveEvent();

    // Filter to registered + active event
    const shifts = user.volunteerShifts
      .filter((s) => s.status === "registered" && s.shift)
      .filter((s) => !activeEvent || String(s.shift.eventId) === String(activeEvent._id))
      .map((s) => s.shift);

    res.json({ shifts, totalHours: user.totalHours });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};