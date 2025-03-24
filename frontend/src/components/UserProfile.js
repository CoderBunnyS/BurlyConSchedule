import React, { useState, useEffect } from "react";
import "../styles/profile.css";

export default function UserProfile() {
  const [volunteerShifts, setVolunteerShifts] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    fetch("/api/users/me/shifts") // Future: replace with auth-based request
      .then((res) => res.json())
      .then((data) => {
        setVolunteerShifts(data.shifts);
        setTotalHours(data.totalHours);
      })
      .catch((error) => console.error("Error fetching volunteer shifts:", error));
  }, []);

  const handleCancelShift = async (shiftId) => {
    try {
      const response = await fetch(`/api/shifts/${shiftId}/cancel`, {
        method: "POST",
      });

      if (response.ok) {
        setVolunteerShifts((prevShifts) => prevShifts.filter((shift) => shift._id !== shiftId));
      } else {
        console.error("Failed to cancel shift");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">My Volunteer Shifts</h1>
      <p className="page-subtitle">🕒 Total Hours Volunteered: {totalHours}</p>

      {volunteerShifts.length === 0 ? (
        <p>No upcoming shifts.</p>
      ) : (
        volunteerShifts.map((shift) => (
          <div key={shift._id} className="shift-card">
            <h3>{shift.role}</h3>
            <p>{shift.day} - {shift.time}</p>
            <button onClick={() => handleCancelShift(shift._id)}>❌ Cancel Shift</button>
          </div>
        ))
      )}
    </div>
  );
}
