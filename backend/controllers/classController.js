const Class = require("../models/Class");

const getClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch classes" });
  }
};

const getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) return res.status(404).json({ error: "Class not found" });
    res.json(classItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch class" });
  }
};

const enrollClass = async (req, res) => {
  res.json({ message: `User enrolled in class ID: ${req.params.id}` });
};

const unenrollClass = async (req, res) => {
  res.json({ message: `User unenrolled from class ID: ${req.params.id}` });
};

const createClass = async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: "Failed to create class" });
  }
};

const editClass = async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClass) return res.status(404).json({ error: "Class not found" });
    res.json(updatedClass);
  } catch (error) {
    res.status(500).json({ error: "Failed to update class" });
  }
};

const deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) return res.status(404).json({ error: "Class not found" });
    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete class" });
  }
};

module.exports = { getClasses, getClassById, enrollClass, unenrollClass, createClass, editClass, deleteClass };
