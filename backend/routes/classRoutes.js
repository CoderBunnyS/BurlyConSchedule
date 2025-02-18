const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");

// Public Routes
router.get("/", classController.getClasses);
router.get("/:id", classController.getClassById);

// Protected Routes (Require Authentication)
router.post("/:id/enroll", classController.enrollClass);
router.post("/:id/unenroll", classController.unenrollClass);

// Admin-Only Routes
router.post("/", classController.createClass);
router.patch("/:id", classController.editClass);  // ✅ Edit class route added
router.delete("/:id", classController.deleteClass);

module.exports = router;
