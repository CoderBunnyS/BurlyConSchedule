const express = require("express");
const router = express.Router();
const { getRoles, createRole } = require("../controllers/ShiftRole");

router.get("/", getRoles);
router.post("/", createRole); // admin-only in future

module.exports = router;
