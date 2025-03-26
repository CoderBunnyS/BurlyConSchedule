import React, { useState, useEffect } from "react";

export default function ShiftForm({ onShiftCreated }) {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    role: "",
    taskDescription: "",
    volunteersNeeded: 1,
    notes: ""
  });

  // Fetch roles from backend
  useEffect(() => {
    fetch(fetch("http://localhost:5001/api/shiftroles"))
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error fetching shift roles:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newShift = await response.json();
        onShiftCreated(newShift); // Pass back to parent to update the list
        setFormData({
          date: "",
          startTime: "",
          endTime: "",
          role: "",
          taskDescription: "",
          volunteersNeeded: 1,
          notes: ""
        });
      } else {
        console.error("Failed to create shift");
      }
    } catch (err) {
      console.error("Error creating shift:", err);
    }
  };

  return (
    <form className="shift-form" onSubmit={handleSubmit}>
      <h2>Create New Shift</h2>

      <label>Date:</label>
      <input type="date" name="date" value={formData.date} onChange={handleChange} required />

      <label>Start Time (military):</label>
      <input type="text" name="startTime" value={formData.startTime} onChange={handleChange} placeholder="e.g. 0700" required />

      <label>End Time (military):</label>
      <input type="text" name="endTime" value={formData.endTime} onChange={handleChange} placeholder="e.g. 1100" required />

      <label>Role:</label>
      <select name="role" value={formData.role} onChange={handleChange} required>
        <option value="">-- Select a role --</option>
        {roles.map((role) => (
          <option key={role._id} value={role.name}>
            {role.name}
          </option>
        ))}
      </select>

      <label>Task Description:</label>
      <textarea name="taskDescription" value={formData.taskDescription} onChange={handleChange} required />

      <label>Volunteers Needed:</label>
      <input type="number" name="volunteersNeeded" min="1" value={formData.volunteersNeeded} onChange={handleChange} required />

      <label>Notes (admin only):</label>
      <textarea name="notes" value={formData.notes} onChange={handleChange} />

      <button type="submit">➕ Create Shift</button>
    </form>
  );
}
