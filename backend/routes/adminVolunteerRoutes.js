const express = require("express");
const router = express.Router();
const { getVolunteers } = require("../controllers/adminVolunteerController");

router.get("/volunteers", getVolunteers); // <-- Add `/volunteers` here

module.exports = router;
