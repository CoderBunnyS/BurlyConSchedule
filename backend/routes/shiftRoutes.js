const express = require("express");
const router = express.Router();
const {
  createShift,
  getAllShifts,
  deleteShift,
  getShiftVolunteers,
  markNoShow
} = require("../controllers/shiftController");

router.post("/", createShift);
router.get("/", getAllShifts);
router.delete("/:id", deleteShift);
router.get("/:id/volunteers", getShiftVolunteers);
router.patch("/mark-no-show", markNoShow);

module.exports = router;
