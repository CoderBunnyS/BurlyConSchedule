import React, { useState, useEffect } from 'react';
import "../styles/volunteer.css";
import Header from "./Header";

export default function VolunteerShifts() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [shifts, setShifts] = useState([]);

  // Fetch shifts from backend
  useEffect(() => {
    fetch(`/api/shifts?day=${selectedDay}`)
      .then(response => response.json())
      .then(data => setShifts(data))
      .catch(error => console.error("Error fetching shifts:", error));
  }, [selectedDay]);

  // Register for a shift (Auth not required yet)
  const handleRegister = async (shiftId) => {
    try {
      const response = await fetch(`/api/shifts/${shiftId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setShifts(prevShifts =>
          prevShifts.map(shift =>
            shift._id === shiftId
              ? { ...shift, availableSpots: shift.availableSpots - 1 }
              : shift
          )
        );
      } else {
        console.error("Failed to register for shift");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="page-container">
    <Header />
      <h1 className="page-title">Volunteer Shifts</h1>
      <p className="page-subtitle">Choose your shift and support the community!</p>

      <div>
        <label>Select Day:</label>
        <select
          onChange={(e) => setSelectedDay(e.target.value)}
          value={selectedDay}
          className="button"
        >
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
      </div>

      {shifts.map(shift => (
        <div key={shift._id} className="shift-card">
          <h3>{shift.role}</h3>
          <p>{shift.day} - {shift.time}</p>
          <p>Available Spots: {shift.availableSpots}</p>
          <button
            className={`button ${shift.availableSpots <= 0 ? "disabled" : ""}`}
            disabled={shift.availableSpots <= 0}
            onClick={() => handleRegister(shift._id)}
          >
            Register
          </button>
        </div>
      ))}
    </div>
  );
}
