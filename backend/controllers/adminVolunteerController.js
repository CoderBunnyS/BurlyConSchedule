const User = require("../models/User"); // Your user model
const Shift = require("../models/Shift"); // Your shift model

// Fetch volunteers and their assigned shifts
exports.getVolunteers = async (req, res) => {
  try {
    // Fetch all users who are assigned to at least one shift
    const users = await User.find({}).lean(); // assuming all users are potential volunteers

    // Fetch shifts to check who's assigned where
    const shifts = await Shift.find({}).lean();

    const volunteerData = users.map((user) => {
      // Find shifts this user is registered for
      const userShifts = shifts.filter((shift) =>
        shift.volunteersRegistered?.includes(user._id)
      );

      // Calculate total hours (we'll assume each shift is 4 hours for now unless you later want a better calculation!)
      const totalHours = userShifts.length * 4;

      return {
        id: user._id,
        name: user.preferredName || user.name || "Unnamed Volunteer",
        email: user.email,
        shifts: userShifts.map((shift) => ({
          id: shift._id,
          role: shift.role,
          date: shift.date,
          startTime: shift.startTime,
          endTime: shift.endTime,
        })),
        totalHours,
      };
    });

    res.json(volunteerData);
  } catch (err) {
    console.error("Error fetching volunteers:", err);
    res.status(500).json({ message: "Server error fetching volunteers" });
  }
};
