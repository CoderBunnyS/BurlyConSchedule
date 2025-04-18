const express = require("express");
const router = express.Router();
const {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} = require("../controllers/shiftRoleController");

router.get("/", getRoles);
router.post("/", createRole);
router.patch("/:id", updateRole); // ✅ NEW
router.delete("/:id", deleteRole); // ✅ NEW

module.exports = router;
