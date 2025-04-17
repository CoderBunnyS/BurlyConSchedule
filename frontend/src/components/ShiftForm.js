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

  // ✅ Fetch roles from backend
  useEffect(() => {
    fetch("http://localhost:5001/api/shiftroles")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched roles:", data);
        setRoles(data);
      })
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
      const response = await fetch("http://localhost:5001/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newShift = await response.json();
        onShiftCreated(newShift);
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

      <label htmlFor="date">Date:</label>
      <input
        id="date"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
      />

      <label htmlFor="startTime">Start Time (military):</label>
      <input
        id="startTime"
        type="text"
        name="startTime"
        value={formData.startTime}
        onChange={handleChange}
        placeholder="e.g. 0700"
        required
      />

      <label htmlFor="endTime">End Time (military):</label>
      <input
        id="endTime"
        type="text"
        name="endTime"
        value={formData.endTime}
        onChange={handleChange}
        placeholder="e.g. 1100"
        required
      />

      <label htmlFor="role">Role:</label>
      <select
        id="role"
        name="role"
        value={formData.role}
        onChange={handleChange}
        required
      >
        <option value="">-- Select a role --</option>
        {roles.map((role) => (
          <option key={role._id} value={role.name}>
            {role.name}
          </option>
        ))}
      </select>

      <label htmlFor="taskDescription">Task Description:</label>
      <textarea
        id="taskDescription"
        name="taskDescription"
        value={formData.taskDescription}
        onChange={handleChange}
        required
      />

      <label htmlFor="volunteersNeeded">Volunteers Needed:</label>
      <input
        id="volunteersNeeded"
        type="number"
        name="volunteersNeeded"
        min="1"
        value={formData.volunteersNeeded}
        onChange={handleChange}
        required
      />

      <label htmlFor="notes">Notes (admin only):</label>
      <textarea
        id="notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
      />

      <button type="submit">➕ Create Shift</button>
    </form>
  );
}
