const User = require("../models/User");
const Shift = require("../models/FlexibleShift");

exports.getVolunteers = async (req, res) => {
  try {
    const users = await User.find({}).lean();
    const shifts = await Shift.find({}).lean();

    const volunteerData = users.map((user) => {
      const userShifts = shifts.filter((shift) =>
        shift.volunteersRegistered?.includes(user.fusionAuthId)

      );
    
      const totalHours = userShifts.reduce((sum, shift) => {
        const start = new Date(`${shift.date}T${shift.startTime}`);
        let end = new Date(`${shift.date}T${shift.endTime}`);
      
        // If the end time is earlier than the start, it's likely past midnight → add a day
        if (end <= start) {
          end.setDate(end.getDate() + 1);
        }
      
        const duration = (end - start) / (1000 * 60 * 60); // hours
        return sum + duration;
      }, 0);
      
    
      // DEBUG LOGS
      console.log(`User: ${user.email}`);
      console.log(`  ➤ Matched shifts: ${userShifts.length}`);
      console.log(`  ➤ Total hours: ${totalHours}`);
      console.log("  ➤ Shift IDs:", userShifts.map((s) => s._id));
    
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
        totalHours: Math.round(totalHours * 100) / 100,
      };
    });
    

    res.json(volunteerData);
  } catch (err) {
    console.error("Error fetching volunteers:", err);
    res.status(500).json({ message: "Server error fetching volunteers" });
  }
};
