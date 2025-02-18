const VolunteerShift = require("../models/VolunteerShift");

const getShifts = async (req, res) => {
  try {
    const shifts = await VolunteerShift.find();
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch volunteer shifts" });
  }
};

const getShiftById = async (req, res) => {
  try {
    const shift = await VolunteerShift.findById(req.params.id);
    if (!shift) return res.status(404).json({ error: "Shift not found" });
    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shift" });
  }
};

const signUpForShift = async (req, res) => {
  res.json({ message: `User signed up for shift ID: ${req.params.id}` });
};

const cancelShift = async (req, res) => {
  res.json({ message: `User canceled shift ID: ${req.params.id}` });
};

const checkInShift = async (req, res) => {
  res.json({ message: `User checked in for shift ID: ${req.params.id}` });
};

const checkOutShift = async (req, res) => {
  res.json({ message: `User checked out from shift ID: ${req.params.id}` });
};

const createShift = async (req, res) => {
  try {
    const newShift = new VolunteerShift(req.body);
    await newShift.save();
    res.status(201).json(newShift);
  } catch (error) {
    res.status(500).json({ error: "Failed to create volunteer shift" });
  }
};

const deleteShift = async (req, res) => {
  try {
    const deletedShift = await VolunteerShift.findByIdAndDelete(req.params.id);
    if (!deletedShift) return res.status(404).json({ error: "Shift not found" });
    res.json({ message: "Shift deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete shift" });
  }
};

module.exports = { getShifts, getShiftById, signUpForShift, cancelShift, checkInShift, checkOutShift, createShift, deleteShift };
