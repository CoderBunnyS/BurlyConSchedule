const express = require("express");
const router = express.Router();
const {
  getHourlyNeedsByDate,
  saveBulkHourlyNeeds,
  signUpForHourlyNeed,
  cancelHourlyNeed,
  getUserHourlyNeeds,
} = require("../controllers/hourlyNeedsController");

// ---- Routes ----
router.get("/user/:userId", getUserHourlyNeeds); 
router.get("/:date", getHourlyNeedsByDate);     
router.post("/bulk", saveBulkHourlyNeeds);  
router.post("/:id/signup", signUpForHourlyNeed); 
router.post("/:id/cancel", cancelHourlyNeed); 

module.exports = router;
