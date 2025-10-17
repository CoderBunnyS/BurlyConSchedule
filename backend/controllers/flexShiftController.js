const FlexibleShift = require("../models/FlexibleShift");
const User = require("../models/User");

// GET users shifts
const getUserFlexShifts = async (req, res) => {
  try {
    const user = await User.findOne({ fusionAuthId: req.params.userId }).populate({
      path: "volunteerShifts.shift",
      model: "FlexibleShift"
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Filter shifts
    const shifts = user.volunteerShifts
      .filter((s) => s.shift && s.shift instanceof Object) 
      .map((s) => ({
        ...s.shift.toObject(),
        status: s.status
      }));

    const totalHours = shifts.reduce((sum, shift) => {
        const start = new Date(`1970-01-01T${shift.startTime}`);
        let end = new Date(`1970-01-01T${shift.endTime}`);
        
        if (end < start) {
          // allow shift to span midnight
          end.setDate(end.getDate() + 1);
        }
        
        const hours = (end - start) / (1000 * 60 * 60);
        return sum + hours;
        
    }, 0);

    res.json({ shifts, totalHours });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user shifts", error: err.message });
  }
};

// GET all shifts
const getAllFlexShifts = async (req, res) => {
  try {
    const shifts = await FlexibleShift.find()
      .populate('volunteersRegistered', 'preferredName email fusionAuthId')
      .sort({ date: 1, startTime: 1 });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching shifts", error: err.message });
  }
};

// GET shifts by date
const getShiftsByDate = async (req, res) => {
  const { date } = req.params;
  try {
    const shifts = await FlexibleShift.find({ date })
      .populate('volunteersRegistered', 'preferredName email fusionAuthId')
      .sort({ startTime: 1 });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching shifts for date", error: err.message });
  }
};

// POST shifts
const createFlexShift = async (req, res) => {
  try {
    const shift = new FlexibleShift(req.body);
    await shift.save();
    res.status(201).json(shift);
  } catch (err) {
    res.status(400).json({ message: "Error creating shift", error: err.message });
  }
};

// PATCH shifts
const updateFlexShift = async (req, res) => {
  try {
    const updated = await FlexibleShift.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Shift not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("updateFlexShift error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST new shift
const signUpForFlexShift = async (req, res) => {
  const { userId } = req.body; 
  const { id: shiftId } = req.params;

  try {
    // gotta find the user by fusionAuthId to get MongoDB _id
    const user = await User.findOne({ fusionAuthId: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const shift = await FlexibleShift.findById(shiftId);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    // Check MongoDB ObjectId
    if (shift.volunteersRegistered.some(id => id.equals(user._id))) {
      return res.status(400).json({ message: "Already signed up" });
    }

    if (shift.volunteersRegistered.length >= shift.volunteersNeeded) {
      return res.status(400).json({ message: "Shift full" });
    }

    // Push MongoDB ObjectId
    shift.volunteersRegistered.push(user._id);
    await shift.save();

    await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          volunteerShifts: {
            shift: shift._id,
            refModel: "FlexibleShift",
            status: "registered"
          }
        }
      }
    );

    res.json({ message: "Signed up successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error signing up", error: err.message });
  }
};

// POST shift cancellation
const cancelFlexShift = async (req, res) => {
  const { userId } = req.body; 
  const { id: shiftId } = req.params;

  try {
    // Find user by fusionAuthId to get MongoDB _id
    const user = await User.findOne({ fusionAuthId: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const shift = await FlexibleShift.findById(shiftId);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    // Remove using MongoDB ObjectId
    shift.volunteersRegistered = shift.volunteersRegistered.filter(
      (id) => !id.equals(user._id)
    );
    await shift.save();

    await User.findByIdAndUpdate(
      user._id,
      {
        $pull: {
          volunteerShifts: {
            shift: shift._id
          }
        }
      }
    );

    res.json({ message: "Shift canceled" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling shift", error: err.message });
  }
};

// DELETE shift
const deleteFlexShift = async (req, res) => {
  try {
    const shift = await FlexibleShift.findByIdAndDelete(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    await User.updateMany(
      {},
      { $pull: { volunteerShifts: { shift: shift._id } } }
    );

    res.json({ message: "Shift deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting shift", error: err.message });
  }
};

module.exports = {
  getUserFlexShifts,
  getAllFlexShifts,
  getShiftsByDate,
  createFlexShift,
  signUpForFlexShift,
  cancelFlexShift,
  deleteFlexShift,
  updateFlexShift
};