const express = require("express");
const router = express.Router();
const FusionAuthClient = require('@fusionauth/node-client');

const {
  getUserProfile,
  updateUserProfile,
  getNotificationHistory
} = require("../controllers/userController");

const User = require("../models/User");

// auth middleware sets req.user (+roles)
const authenticateUser = require("../middleware/authMiddleware");

// minimal role gate (server-side authZ)
const requireLeadOrAdmin = (req, res, next) => {
  const roles = req.user?.roles || [];
  if (roles.includes("Admin") || roles.includes("Lead")) return next();
  return res.status(403).json({ error: "forbidden" });
};

// Initialize FusionAuth client 
const client = new FusionAuthClient(
  process.env.FUSIONAUTH_API_KEY,
  process.env.FUSIONAUTH_URL
);


// ----- user endpoints -----
router.get("/:id", authenticateUser, getUserProfile);
router.patch("/:id", authenticateUser, updateUserProfile);
router.get("/:id/notifications", authenticateUser, getNotificationHistory);

// ----- toggles (Lead/Admin only) -----
router.patch("/:id/noShow", authenticateUser, requireLeadOrAdmin, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { noShow: !!req.body.noShow } },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: "user_not_found" });
    res.json({ ok: true, user });
  } catch (e) { next(e); }
});

router.patch("/:id/restrict", authenticateUser, requireLeadOrAdmin, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isRestricted: !!req.body.isRestricted } },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: "user_not_found" });
    res.json({ ok: true, user });
  } catch (e) { next(e); }
});

// ----- staff notes (Lead/Admin only) -----
router.post("/:id/notes", authenticateUser, requireLeadOrAdmin, async (req, res, next) => {
  try {
    const { text, visibility = "lead", category = "general" } = req.body;
    if (!text || !String(text).trim()) return res.status(400).json({ error: "text_required" });

    const note = {
      by: req.user.id,
      byName: req.user.name || req.user.email,
      visibility,
      category,
      text: String(text).trim()
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $push: { staffNotes: note } },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: "user_not_found" });

    const added = user.staffNotes[user.staffNotes.length - 1];
    res.json({ ok: true, note: added });
  } catch (e) { next(e); }
});

router.patch("/:id/notes/:noteId", authenticateUser, requireLeadOrAdmin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "user_not_found" });

    const n = user.staffNotes.id(req.params.noteId);
    if (!n) return res.status(404).json({ error: "note_not_found" });

    if (req.body.text !== undefined) n.text = String(req.body.text).trim();
    if (req.body.visibility) n.visibility = req.body.visibility;
    if (req.body.category) n.category = req.body.category;

    await user.save();
    res.json({ ok: true, note: n });
  } catch (e) { next(e); }
});

router.delete("/:id/notes/:noteId", authenticateUser, requireLeadOrAdmin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "user_not_found" });

    const n = user.staffNotes.id(req.params.noteId);
    if (!n) return res.status(404).json({ error: "note_not_found" });

    n.deleteOne();
    await user.save();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ----- FusionAuth user data (Lead/Admin only) -----
router.get("/:id/fusionauth", authenticateUser, requireLeadOrAdmin, async (req, res, next) => {
  try {
    const response = await client.retrieveUser(req.params.id);
    const user = response.response.user;
    
    res.json({ 
      mobilePhone: user.mobilePhone || null,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (error) {
    console.error('Error fetching user from FusionAuth:', error);
    res.status(500).json({ error: 'Failed to retrieve user from FusionAuth' });
  }
});

module.exports = router;
