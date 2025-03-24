import React, { useState, useEffect } from "react";
import "../styles/admin.css";

export default function AdminPanel() {
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    fetch("/api/shifts")
      .then((res) => res.json())
      .then((data) => setShifts(data))
      .catch((error) => console.error("Error fetching shifts:", error));
  }, []);

  const handleDeleteShift = async (shiftId) => {
    try {
      const response = await fetch(`/api/shifts/${shiftId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShifts((prevShifts) => prevShifts.filter((shift) => shift._id !== shiftId));
      } else {
        console.error("Failed to delete shift");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Admin Panel - Manage Shifts</h1>
      {shifts.length === 0 ? (
        <p className="page-subtitle">No shifts available</p>
      ) : (
        shifts.map((shift) => (
          <div key={shift._id} className="shift-card">
            <h3>{shift.role}</h3>
            <p>{shift.day} - {shift.time}</p>
            <p>Available Spots: {shift.availableSpots}</p>
            <p>Volunteers Signed Up: {shift.volunteersRegistered.length}</p>

            <button onClick={() => handleDeleteShift(shift._id)}>❌ Delete</button>
          </div>
        ))
      )}
    </div>
  );
}
