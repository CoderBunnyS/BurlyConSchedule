const ShiftRole = require("../models/ShiftRole");

// GET all roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await ShiftRole.find({ isActive: true });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST a new role
exports.createRole = async (req, res) => {
  const { name, description, requirements } = req.body;
  try {
    const newRole = new ShiftRole({ name, description, requirements });
    await newRole.save();
    res.status(201).json(newRole);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
