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
    try {
      const classId = req.params.id;
      const { userId } = req.body; // 🔹 This will be replaced with the JWT user ID later
  
      // Find the class
      const selectedClass = await Class.findById(classId);
      if (!selectedClass) {
        return res.status(404).json({ error: "Class not found" });
      }
  
      // Check if the class is full
      if (selectedClass.enrolledParticipants.length >= selectedClass.capacity) {
        // If class is full, add user to the waitlist
        if (!selectedClass.waitlist.includes(userId)) {
          selectedClass.waitlist.push(userId);
          await selectedClass.save();
          return res.status(200).json({ message: "Class is full. You have been added to the waitlist." });
        } else {
          return res.status(400).json({ error: "User is already on the waitlist." });
        }
      }
  
      // Check if the user is already enrolled
      if (selectedClass.enrolledParticipants.includes(userId)) {
        return res.status(400).json({ error: "User is already enrolled in this class." });
      }
  
      // Enroll the user
      selectedClass.enrolledParticipants.push(userId);
      await selectedClass.save();
  
      res.status(200).json({ message: "Enrollment successful", class: selectedClass });
    } catch (error) {
      res.status(500).json({ error: "Failed to enroll in class", details: error.message });
    }
  };
  
  

const unenrollClass = async (req, res) => {
  res.json({ message: `User unenrolled from class ID: ${req.params.id}` });
};

const createClass = async (req, res) => {
    try {
      const { title, description, instructor, level, requiredMaterials, accessibilityOptions, startTime, endTime, capacity } = req.body;
  
      const newClass = new Class({
        title,
        description,
        instructor,
        level,
        requiredMaterials,
        accessibilityOptions,
        schedule: { startTime, endTime },
        capacity
      });
  
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
