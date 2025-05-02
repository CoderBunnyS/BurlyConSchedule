import React, { useState, useEffect } from "react";
import "../styles/profile.css";
import Header from "./Header";

export default function UserProfile() {
  const [volunteerShifts, setVolunteerShifts] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/shifts/user/6811617f46ed53b3155162c3`)
   // ✅ Updated to match your working route
      .then((res) => res.json())
      .then((data) => {
        setVolunteerShifts(data.shifts || []);
        setTotalHours(data.totalHours || 0);
      })
      .catch((error) => console.error("Error fetching volunteer info:", error));
  }, []);

  const handleCancelShift = async (shiftId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/shifts/${shiftId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "6811617f46ed53b3155162c3" // Replace with dynamic ID once auth is in
        })
      });
  
      if (response.ok) {
        setVolunteerShifts((prevShifts) =>
          prevShifts.filter((shift) => shift._id !== shiftId)
        );
      } else {
        const error = await response.json();
        console.error("Cancel failed:", error.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  

  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">My Volunteer Shifts</h1>
      <p className="page-subtitle">🕒 Total Hours Volunteered: {totalHours}</p>

      {volunteerShifts.length === 0 ? (
        <p>You have no upcoming shifts.</p>
      ) : (
        volunteerShifts.map((shift) => (
          <div key={shift._id} className="shift-card">
            <h3>{shift.role}</h3>
            <p>
              {new Date(shift.date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric"
              })}{" "}
              – {shift.startTime}–{shift.endTime}
            </p>
            <button type="button" onClick={() => handleCancelShift(shift._id)}>
              ❌ Cancel Shift
            </button>
          </div>
        ))
      )}
    </div>
  );
}
