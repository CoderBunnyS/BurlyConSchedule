import React, { useState } from "react";
import { addClass } from "../api";

const AddClassForm = ({ onClassAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    level: "Beginner",
    requiredMaterials: "",
    accessibilityOptions: "",
    startTime: "",
    endTime: "",
    capacity: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newClass = await addClass(formData);
    if (newClass) {
      onClassAdded(newClass); // Update UI
      setFormData({
        title: "",
        description: "",
        instructor: "",
        level: "Beginner",
        requiredMaterials: "",
        accessibilityOptions: "",
        startTime: "",
        endTime: "",
        capacity: ""
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add a New Class</h2>
      <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
      <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
      <input type="text" name="instructor" placeholder="Instructor" value={formData.instructor} onChange={handleChange} required />
      <select name="level" value={formData.level} onChange={handleChange}>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>
      <input type="text" name="requiredMaterials" placeholder="Required Materials" value={formData.requiredMaterials} onChange={handleChange} />
      <input type="text" name="accessibilityOptions" placeholder="Accessibility Options" value={formData.accessibilityOptions} onChange={handleChange} />
      <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} required />
      <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} required />
      <input type="number" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={handleChange} required />
      <button type="submit">Add Class</button>
    </form>
  );
};

export default AddClassForm;
