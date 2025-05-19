// AdminHourlyNeeds.js
import React, { useEffect, useState } from "react";
import "../styles/admin.css";
import Header from "./Header";

export default function AdminHourlyNeeds() {
  const [roles, setRoles] = useState([]);
  const [hourlyNeeds, setHourlyNeeds] = useState({});
  const [date, setDate] = useState("2025-11-07");

  // Hour blocks from 08:00 to 02:00 the next day
  const hours = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00",
    "23:00", "00:00", "01:00", "02:00"
  ];

  useEffect(() => {
    // Load shift roles
    fetch(`${process.env.REACT_APP_API_BASE}/api/shiftroles`)
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error fetching roles:", err));
  }, []);

  useEffect(() => {
    if (!date) return;
    fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/${date}`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = {};
        for (const n of data) {
          const key = `${n.role}-${n.hour}`;
          mapped[key] = n.volunteersNeeded;
        }
        setHourlyNeeds(mapped);
      })
      .catch((err) => console.error("Error fetching hourly needs:", err));
  }, [date]);

  const handleChange = (role, hour, value) => {
    const key = `${role}-${hour}`;
    setHourlyNeeds((prev) => ({
      ...prev,
      [key]: Number.parseInt(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const needsArray = Object.entries(hourlyNeeds)
      .filter(([, val]) => val > 0)
      .map(([key, volunteersNeeded]) => {
        const [role, hour] = key.split("-");
        return { date, role, hour, volunteersNeeded };
      });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, needs: needsArray }),
      });

      if (response.ok) {
        alert("Saved!");
      } else {
        console.error("Failed to save needs.");
      }
    } catch (err) {
      console.error("Error submitting needs:", err);
    }
  };

  return (
    <div className="page-container">
        <Header />
      <h1 className="page-title">🕓 Hourly Volunteer Needs</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="date">Select Date:</label>
        <select
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        >
          <option value="2025-11-05">Wed 11/5</option>
          <option value="2025-11-06">Thu 11/6</option>
          <option value="2025-11-07">Fri 11/7</option>
          <option value="2025-11-08">Sat 11/8</option>
          <option value="2025-11-09">Sun 11/9</option>
        </select>

        <div className="hourly-grid-container">
          <table className="hourly-needs-table">
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
                <tr key={role.name}>
                  <td>{role.name}</td>
                  {hours.map((hour) => {
                    const key = `${role.name}-${hour}`;
                    return (
                      <td key={key}>
                        <input
                          type="number"
                          min="0"
                          max="9"
                          className="tiny-input"
                          value={hourlyNeeds[key] || ""}
                          onChange={(e) =>
                            handleChange(role.name, hour, e.target.value)
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="submit" className="admin-button" style={{ marginTop: "20px" }}>
          💾 Save Needs
        </button>
      </form>
    </div>
  );
}
