const express = require("express");
const router = express.Router();
const {
  getHourlyNeedsByDate,
  saveBulkHourlyNeeds,
  signUpForHourlyNeed 
} = require("../controllers/hourlyNeedsController");

router.get("/:date", getHourlyNeedsByDate); // GET needs for a specific date
router.post("/bulk", saveBulkHourlyNeeds); // POST all needs for a date
router.post("/:id/signup", signUpForHourlyNeed); // POST sign up to volunteer

module.exports = router;
