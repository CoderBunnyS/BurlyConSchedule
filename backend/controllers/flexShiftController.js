// controllers/flexShiftController.js

const FlexibleShift = require("../models/FlexibleShift");
const User = require("../models/User");

// GET /api/volunteer/user/:userId
const getUserFlexShifts = async (req, res) => {
  try {
    const user = await User.findOne({ fusionAuthId: req.params.userId }).populate({
      path: "volunteerShifts.shift",
      model: "FlexibleShift"
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Filter to only flexible shifts
    const shifts = user.volunteerShifts
      .filter((s) => s.shift && s.shift instanceof Object) // avoids nulls or mismatched
      .map((s) => ({
        ...s.shift.toObject(),
        status: s.status
      }));

    const totalHours = shifts.reduce((sum, shift) => {
        const start = new Date(`1970-01-01T${shift.startTime}`);
        let end = new Date(`1970-01-01T${shift.endTime}`);
        
        if (end < start) {
          // If shift goes past midnight, add 1 day to the end time
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

// GET /api/volunteer/
const getAllFlexShifts = async (req, res) => {
  try {
    const shifts = await FlexibleShift.find().sort({ date: 1, startTime: 1 });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching shifts", error: err.message });
  }
};

// POST /api/volunteer/ (admin only)
const createFlexShift = async (req, res) => {
  try {
    const shift = new FlexibleShift(req.body);
    await shift.save();
    res.status(201).json(shift);
  } catch (err) {
    res.status(400).json({ message: "Error creating shift", error: err.message });
  }
};

// POST /api/volunteer/:id/signup
const signUpForFlexShift = async (req, res) => {
  const { userId } = req.body;
  const { id: shiftId } = req.params;

  try {
    const shift = await FlexibleShift.findById(shiftId);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    if (shift.volunteersRegistered.includes(userId)) {
      return res.status(400).json({ message: "Already signed up" });
    }

    if (shift.volunteersRegistered.length >= shift.volunteersNeeded) {
      return res.status(400).json({ message: "Shift full" });
    }

    shift.volunteersRegistered.push(userId);
    await shift.save();

    await User.findOneAndUpdate(
        { fusionAuthId: userId },
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

// POST /api/volunteer/:id/cancel
const cancelFlexShift = async (req, res) => {
  const { userId } = req.body;
  const { id: shiftId } = req.params;

  try {
    const shift = await FlexibleShift.findById(shiftId);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    shift.volunteersRegistered = shift.volunteersRegistered.filter(
      (id) => id.toString() !== userId
    );
    await shift.save();

    await User.findOneAndUpdate(
        { fusionAuthId: userId },
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

// DELETE /api/volunteer/:id (admin only)
const deleteFlexShift = async (req, res) => {
  try {
    const shift = await FlexibleShift.findByIdAndDelete(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });

    // Optionally remove shift from users
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
  createFlexShift,
  signUpForFlexShift,
  cancelFlexShift,
  deleteFlexShift
};
