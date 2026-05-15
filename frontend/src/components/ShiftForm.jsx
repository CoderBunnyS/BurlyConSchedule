import React, { useState, useEffect } from "react";

export default function ShiftForm({ onShiftCreated, existingShifts = [] }) {
  const [roles, setRoles] = useState([]);
  const [eventDates, setEventDates] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    role: "",
    volunteersNeeded: 1,
    notes: ""
  });

  // Fetch roles
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/shiftroles`)
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error fetching shift roles:", err));
  }, []);

  // Fetch active event and generate date options
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/events/active`)
      .then((res) => res.json())
      .then((event) => {
        const dates = [];
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
          const iso = d.toISOString().split("T")[0];
          const weekday = d.toLocaleDateString(undefined, { weekday: "long", timeZone: "UTC" });
          const display = d.toLocaleDateString(undefined, { month: "numeric", day: "numeric", timeZone: "UTC" });
          dates.push({ value: iso, label: `${weekday} ${display}` });
        }
        setEventDates(dates);
        if (dates.length > 0) {
          setFormData((prev) => ({ ...prev, date: dates[0].value }));
        }
      })
      .catch((err) => console.error("Error fetching active event:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
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
      return newStart < end && newEnd > start;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime
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
          date: eventDates[0]?.value || "",
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
        {eventDates.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>

      <label htmlFor="startTime">Start Time:</label>
      <input
        id="startTime"
        type="time"
        name="startTime"
        value={formData.startTime}
        onChange={handleChange}
        step="60"
        required
      />

      <label htmlFor="endTime">End Time:</label>
      <input
        id="endTime"
        type="time"
        name="endTime"
        value={formData.endTime}
        onChange={handleChange}
        step="60"
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
        {roles
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((role) => (
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