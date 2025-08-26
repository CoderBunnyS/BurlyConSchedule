import React, { useState, useEffect } from "react";

export default function ShiftForm({ onShiftCreated, existingShifts = [] }) {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    date: "2025-11-05",
    startTime: "",
    endTime: "",
    role: "",
    volunteersNeeded: 1,
    notes: ""
  });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/shiftroles`)
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error fetching shift roles:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatTime = (milStr) => {
    if (!/^\d{4}$/.test(milStr)) return milStr;
    const hour = milStr.slice(0, 2);
    const min = milStr.slice(2);
    return `${hour}:${min}`;
  };

  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const hasConflict = (newShift, shifts) => {
    const newStart = toMinutes(newShift.startTime);
    const newEnd = toMinutes(newShift.endTime);

    return shifts.some((shift) => {
      if (shift.date !== newShift.date) return false;
      const start = toMinutes(shift.startTime);
      const end = toMinutes(shift.endTime);
      return newStart < end && newEnd > start; // overlap
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      date: formData.date,
      startTime: formatTime(formData.startTime),
      endTime: formatTime(formData.endTime)
    };

    if (hasConflict(payload, existingShifts)) {
      const proceed = window.confirm(
        "⚠️ This shift overlaps with another one.\nDo you want to save it anyway?"
      );
      if (!proceed) return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const newShift = await response.json();
        onShiftCreated?.(newShift);
        setFormData({
          date: "2025-11-05",
          startTime: "",
          endTime: "",
          role: "",
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
      <select name="date" value={formData.date} onChange={handleChange} required>
        <option value="">-- Select a date --</option>
        <option value="2025-11-05">Wednesday 11/5 (Setup)</option>
        <option value="2025-11-06">Thursday 11/6</option>
        <option value="2025-11-07">Friday 11/7</option>
        <option value="2025-11-08">Saturday 11/8</option>
        <option value="2025-11-09">Sunday 11/9</option>
      </select>

      <label htmlFor="startTime">Start Time (e.g. 0700):</label>
      <input
        id="startTime"
        type="text"
        name="startTime"
        value={formData.startTime}
        onChange={handleChange}
        placeholder="e.g. 0700"
        required
      />

      <label htmlFor="endTime">End Time (e.g. 1100):</label>
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
