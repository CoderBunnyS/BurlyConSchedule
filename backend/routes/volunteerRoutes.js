const express = require("express");
const router = express.Router();
const {
  getShifts,
  getShiftById,
  signUpForShift,
  cancelShift,
  checkInShift,
  checkOutShift,
  createShift,
  deleteShift,
} = require("../controllers/volunteerController");

// Middleware (Auth Not Implemented Yet)
const authenticateUser = (req, res, next) => {
  console.log("Auth middleware placeholder. Will validate token later.");
  next(); // Allow access until authentication is implemented
};

const authorizeAdmin = (req, res, next) => {
  console.log("Admin check placeholder. Will enforce admin access later.");
  next(); // Allow access for now
};

// **Public Routes (No Authentication Required)**
router.get("/", getShifts);
router.get("/:id", getShiftById);

// **Protected Routes (Require Authentication in the Future)**
router.post("/:id/signup", authenticateUser, signUpForShift);
router.post("/:id/cancel", authenticateUser, cancelShift);
router.patch("/:id/checkin", authenticateUser, checkInShift);
router.patch("/:id/checkout", authenticateUser, checkOutShift);

// **Admin-Only Routes**
router.post("/", authenticateUser, authorizeAdmin, createShift);
router.delete("/:id", authenticateUser, authorizeAdmin, deleteShift);

module.exports = router;
