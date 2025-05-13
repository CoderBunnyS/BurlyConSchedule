const express = require("express");
const router = express.Router();
const {
  getHourlyNeedsByDate,
  saveBulkHourlyNeeds,
  signUpForHourlyNeed,
  cancelHourlyNeed,
  getUserHourlyNeeds,
} = require("../controllers/hourlyNeedsController");

// ✅ Specific routes first!
router.get("/user/:userId", getUserHourlyNeeds); // GET all needs for a user
router.get("/:date", getHourlyNeedsByDate);      // GET needs for a specific date
router.post("/bulk", saveBulkHourlyNeeds);       // POST all needs for a date
router.post("/:id/signup", signUpForHourlyNeed); // POST sign up to volunteer
router.post("/:id/cancel", cancelHourlyNeed);    // POST cancel a volunteer shift

module.exports = router;
