const HourlyNeed = require("../models/HourlyNeed");

// GET all hourly needs for a given date
exports.getHourlyNeedsByDate = async (req, res) => {
  try {
    const needs = await HourlyNeed.find({ date: req.params.date });
    res.json(needs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST bulk needs for a date (replace existing for that date)
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
  const { userId } = req.body; // Replace this with auth later
  const { id } = req.params;

  try {
    const need = await HourlyNeed.findById(id);
    if (!need) return res.status(404).json({ message: "Need not found" });

    if (need.volunteersNeeded <= 0) {
      return res.status(400).json({ message: "No more volunteers needed" });
    }

    // TEMP: just decrement needed count for MVP
    need.volunteersNeeded -= 1;
    await need.save();

    res.json({ message: "Signed up successfully", need });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

