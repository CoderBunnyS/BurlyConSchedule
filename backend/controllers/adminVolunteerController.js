const User = require("../models/User");
const Shift = require("../models/FlexibleShift");
const fusionAuthService = require("../utils/fusionAuthService");

exports.getVolunteers = async (req, res) => {
  try {
    const users = await User.find({}).lean();
    const shifts = await Shift.find({}).lean();

    const volunteerData = users.map((user) => {
      const userShifts = shifts.filter((shift) =>
        shift.volunteersRegistered?.some(
          (id) => id.toString() === user._id.toString()
        )
      );
    
      const totalHours = userShifts.reduce((sum, shift) => {
        const start = new Date(`${shift.date}T${shift.startTime}`);
        let end = new Date(`${shift.date}T${shift.endTime}`);
      
        if (end <= start) {
          end.setDate(end.getDate() + 1);
        }
      
        const duration = (end - start) / (1000 * 60 * 60);
        return sum + duration;
      }, 0);
      
      console.log(`User: ${user.email}`);
      console.log(`  ➤ Matched shifts: ${userShifts.length}`);
      console.log(`  ➤ Total hours: ${totalHours}`);
      console.log("  ➤ Shift IDs:", userShifts.map((s) => s._id));
    
      return {
        id: user._id,
        name: user.preferredName || user.name || "Unnamed Volunteer",
        email: user.email,
        noShow: user.noShow,
        isRestricted: user.isRestricted,
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

exports.getUserPhone = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await fusionAuthService.getUserPhone(user.fusionAuthId);
    
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({ 
      mobilePhone: result.phone
    });
  } catch (error) {
    console.error('Error fetching user phone:', error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
};