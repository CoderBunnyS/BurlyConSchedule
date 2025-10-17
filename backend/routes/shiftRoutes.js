const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticateUser = require("../middleware/authMiddleware"); 
const {
  getShifts,
  getShiftById,
  signUpForShift,
  cancelShift,
  getUserShifts,
  createShift,
  deleteShift
} = require("../controllers/volunteerController");

// noshow policy flag
const BLOCK_NOSHOW = String(process.env.BLOCK_NOSHOW_SIGNUPS || "").toLowerCase() === "true";

// block restricted users
async function blockRestricted(req, res, next) {
  try {
    const me = await User.findById(req.user.id).lean();
    if (!me) return res.status(404).json({ error: "user_not_found" });

    if (me.isRestricted) {
      return res.status(403).json({
        error: "restricted",
        message: "This account is restricted from signing up for shifts."
      });
    }
    if (BLOCK_NOSHOW && me.noShow) {
      return res.status(403).json({
        error: "no_show_blocked",
        message: "Signups are blocked due to a no-show policy."
      });
    }
    next();
  } catch (e) {
    next(e);
  }
}

// ---- Routes ----

// Get shifts for user 
router.get("/user/:userId", getUserShifts);

// Public routes
router.get("/", getShifts);
router.get("/:id", getShiftById);

// Volunteer actions
router.post("/:id/signup", authenticateUser, blockRestricted, signUpForShift);
router.post("/:id/cancel", authenticateUser, cancelShift);

// Admin actions
router.post("/", createShift);
router.delete("/:id", deleteShift);

module.exports = router;
