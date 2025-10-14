const express = require("express");
const router = express.Router();
const { getVolunteers, getUserPhone } = require("../controllers/adminVolunteerController");

router.get("/volunteers", getVolunteers); 
router.get("/users/:id/phone", getUserPhone);

module.exports = router;
