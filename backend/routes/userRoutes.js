const express = require("express");
const router = express.Router();
const { getUserProfile, updateUserProfile, getNotificationHistory } = require("../controllers/userController");

// User Routes
router.get("/:id", getUserProfile);
router.patch("/:id", updateUserProfile);
router.get("/:id/notifications", getNotificationHistory);

module.exports = router;
