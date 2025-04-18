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

// PATCH update an existing role
exports.updateRole = async (req, res) => {
  try {
    const updated = await ShiftRole.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Role not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE a role
exports.deleteRole = async (req, res) => {
  try {
    const deleted = await ShiftRole.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Role not found" });
    res.json({ message: "Role deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

