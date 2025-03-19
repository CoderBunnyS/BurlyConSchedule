import React, { useState, useEffect } from 'react';
import "../styles/volunteer.css";

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
    <div>
      <h1>Volunteer Shifts</h1>
      <button><a href='/'>Home</a></button>

      {/* Dropdown to Select Day */}
      <label>Select Day:</label>
      <select onChange={(e) => setSelectedDay(e.target.value)} value={selectedDay}>
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
        <option value="Saturday">Saturday</option>
        <option value="Sunday">Sunday</option>
      </select>

      {/* Render shifts dynamically */}
      {shifts.map(shift => (
        <div key={shift._id}>
          <h3>{shift.role}</h3>
          <button
            onClick={() => handleRegister(shift._id)}
            disabled={shift.availableSpots <= 0}
            className={shift.availableSpots <= 0 ? "disabled" : ""}
          >
            {shift.time} ({shift.availableSpots} spots left)
          </button>
        </div>
      ))}
    </div>
  );
}
