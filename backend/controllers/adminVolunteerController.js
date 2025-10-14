const User = require("../models/User");
const Shift = require("../models/FlexibleShift");
const { FusionAuthClient } = require('@fusionauth/node-client');

// Initialize FusionAuth client
const client = new FusionAuthClient(
  process.env.FUSIONAUTH_API_KEY,
  process.env.FUSIONAUTH_URL
);

exports.getVolunteers = async (req, res) => {
  try {
    const users = await User.find({}).lean();
    const shifts = await Shift.find({}).lean();

    const volunteerData = users.map((user) => {
      // Match by MongoDB ObjectId instead of fusionAuthId
      const userShifts = shifts.filter((shift) =>
        shift.volunteersRegistered?.some(
          (id) => id.toString() === user._id.toString()
        )
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
  console.log("getUserPhone called for ID:", req.params.id);
  
  try {
    // First get the user from MongoDB to get their fusionAuthId
    const user = await User.findById(req.params.id);
    console.log("Found user in MongoDB:", user ? user.email : "NOT FOUND");
    
    if (!user) {
      console.log("User not found in MongoDB");
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("FusionAuth ID:", user.fusionAuthId);
    
    // Then use the fusionAuthId to call FusionAuth
    const response = await client.retrieveUser(user.fusionAuthId);
    console.log("FusionAuth response received");
    
    res.json({ 
      mobilePhone: response.response.user.mobilePhone || null
    });
  } catch (error) {
    console.error('Error fetching user from FusionAuth:', error);
    console.error('Full error details:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
};