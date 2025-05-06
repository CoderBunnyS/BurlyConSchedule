import React, { useState, useEffect } from "react";
import "../styles/admin.css"; // Make sure styling supports table & inputs

export default function AdminHourlyGrid() {
  const [roles, setRoles] = useState([]);
  const [selectedDate, setSelectedDate] = useState("2025-11-06");
  const [hourlyData, setHourlyData] = useState({}); // { roleId: { hour: count } }

  const hours = Array.from({ length: 13 }, (_, i) => `${i + 8}:00`); // 8:00–20:00

  // Fetch roles
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/shiftroles`)
      .then((res) => res.json())
      .then(setRoles)
      .catch((err) => console.error("Error loading roles:", err));
  }, []);

  // Fetch existing HourlyNeed entries for the selected date
  useEffect(() => {
    if (!selectedDate) return;

    fetch(`${process.env.REACT_APP_API_BASE}/api/hourlyneeds/${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = {};
        data.forEach(({ role, hour, count }) => {
          if (!formatted[role]) formatted[role] = {};
          formatted[role][hour] = count;
        });
        setHourlyData(formatted);
      })
      .catch((err) => console.error("Error loading hourly needs:", err));
  }, [selectedDate]);

  const handleInputChange = (roleId, hour, value) => {
    setHourlyData((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [hour]: value === "" ? "" : Math.max(0, parseInt(value)),
      },
    }));
  };

  const handleSave = async () => {
    const payload = [];

    for (const roleId in hourlyData) {
      for (const hour in hourlyData[roleId]) {
        const count = hourlyData[roleId][hour];
        payload.push({
          date: selectedDate,
          role: roleId,
          hour,
          count: count || 0,
        });
      }
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/hourlyneeds/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Hourly needs saved!");
      } else {
        alert("❌ Failed to save.");
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Set Hourly Volunteer Needs</h1>

      <label htmlFor="date">📅 Select Date:</label>
      <select
        id="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      >
        <option value="2025-11-05">Wednesday 11/5 (Setup)</option>
        <option value="2025-11-06">Thursday 11/6</option>
        <option value="2025-11-07">Friday 11/7</option>
        <option value="2025-11-08">Saturday 11/8</option>
        <option value="2025-11-09">Sunday 11/9</option>
      </select>

      <div className="table-scroll">
        <table className="volunteer-table" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Role</th>
              {hours.map((hour) => (
                <th key={hour}>{hour}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role._id}>
                <td>{role.name}</td>
                {hours.map((hour) => (
                  <td key={hour}>
                    <input
                      type="number"
                      min="0"
                      value={hourlyData[role._id]?.[hour] || ""}
                      onChange={(e) =>
                        handleInputChange(role._id, hour, e.target.value)
                      }
                      style={{ width: "50px" }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={handleSave} className="admin-button" style={{ marginTop: "20px" }}>
        💾 Save Hourly Needs
      </button>
    </div>
  );
}
