import React, { useState, useEffect } from "react";
import "../styles/profile.css";
import Header from "./Header";

export default function UserProfile() {
  const [volunteerShifts, setVolunteerShifts] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const userId = "6811617f46ed53b3155162c3"; // Temporary ID

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/hourlyneeds/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setVolunteerShifts(data.shifts || []);
        setTotalHours(data.totalHours || 0);
      })
      .catch((error) => console.error("Error fetching volunteer info:", error));
  }, []);

  const handleCancelShift = async (shiftId) => {
    const confirmed = window.confirm("Are you sure you want to cancel this hour?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/hourlyneeds/${shiftId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        setVolunteerShifts((prev) => prev.filter((shift) => shift._id !== shiftId));
        setTotalHours((prev) => Math.max(prev - 1, 0));
      } else {
        const error = await response.json();
        console.error("Cancel failed:", error.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatTime = (hourStr) => {
    const [hour, min] = hourStr.split(":").map(Number);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = ((hour + 11) % 12) + 1;
    return `${displayHour}:${min.toString().padStart(2, "0")} ${suffix}`;
  };

  const getDiscountCode = () => {
    if (totalHours >= 8) return "FULLPASS2024";
    if (totalHours >= 4) return "HALFPASS2024";
    return null;
  };

  // Group shifts by role and date
  const grouped = volunteerShifts.reduce((acc, shift) => {
    const key = `${shift.role}|${shift.date}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(shift);
    return acc;
  }, {});
  

  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">My Volunteer Shifts</h1>
      <p className="page-subtitle">🕒 Total Hours Volunteered: {totalHours}</p>

      {totalHours >= 4 && (
        <div className="alert-card">
          <p>
            🎉 You're eligible for a{" "}
            <strong>{totalHours >= 8 ? "FREE FULL PASS" : "HALF PRICE PASS"}</strong>!
            Use this code when registering:{" "}
            <strong>{getDiscountCode()}</strong>
          </p>
        </div>
      )}

      {volunteerShifts.length === 0 ? (
        <p>You have no upcoming volunteer hours.</p>
      ) : (
        Object.entries(grouped).map(([key, shifts]) => {
          const [role, date] = key.split("|");
          const sorted = shifts
            .slice()
            .sort((a, b) => a.hour.localeCompare(b.hour));

          return (
            <div key={key} className="shift-card">
              <h3>{role}</h3>
              <p>
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric"
                })}
              </p>

              <ul>
                {sorted.map((shift) => {
                  const start = formatTime(shift.hour);
                  const end = formatTime(`${Number.parseInt(shift.hour.split(":")[0]) + 1}:00`);
                  return (
                    <li key={shift._id}>
                      🕒 {start} – {end}{" "}
                      <button
                        type="button"
                        onClick={() => handleCancelShift(shift._id)}
                      >
                        ❌ Cancel
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}
