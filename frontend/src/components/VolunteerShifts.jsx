import React, { useEffect, useState } from "react";
import "../styles/volunteer.css";
import Header from "./Header";
import { getUserId } from "../utils/authUtils";

export default function VolunteerShifts() {
  const [selectedDate, setSelectedDate] = useState("2025-11-07");
  const [shifts, setShifts] = useState([]);
  const [userId, setUserId] = useState(null);

  const dateOptions = [
    { label: "Wed 11/5", value: "2025-11-05" },
    { label: "Thu 11/6", value: "2025-11-06" },
    { label: "Fri 11/7", value: "2025-11-07" },
    { label: "Sat 11/8", value: "2025-11-08" },
    { label: "Sun 11/9", value: "2025-11-09" },
  ];

  const scheduleImages = {
    "2025-11-05": "https://i.ibb.co/spkQFTwf/Thursday.png",
    "2025-11-06": "https://burlycon.org/wp-content/uploads/2024/10/friday-2024.png",
    "2025-11-07": "https://burlycon.org/wp-content/uploads/2024/10/saturday-2024.png",
    "2025-11-08": "https://burlycon.org/wp-content/uploads/2024/10/sunday-2024.png",
    "2025-11-09": "https://burlycon.org/wp-content/uploads/2024/10/sunday-2024.png",
  };

  // Get userId
  useEffect(() => {
    const id = getUserId();
    if (id) setUserId(id);
  }, []);
  

  // Fetch shifts for all days, then filter locally
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((shift) => shift.date === selectedDate);
        setShifts(filtered);
      })
      .catch((err) => console.error("Error fetching shifts:", err));
  }, [selectedDate]);

  const to12Hour = (timeStr) => {
    const [hour, min] = timeStr.split(":").map(Number);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = ((hour + 11) % 12) + 1;
    return `${displayHour}:${min.toString().padStart(2, "0")} ${suffix}`;
  };

  const handleSignup = async (shiftId) => {
    if (!userId) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/${shiftId}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        setShifts((prev) =>
          prev.map((shift) =>
            shift._id === shiftId
              ? { ...shift, volunteersRegistered: [...shift.volunteersRegistered, userId] }
              : shift
          )
        );
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  const handleCancel = async (shiftId) => {
    if (!userId) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/${shiftId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        setShifts((prev) =>
          prev.map((shift) =>
            shift._id === shiftId
              ? {
                  ...shift,
                  volunteersRegistered: shift.volunteersRegistered.filter((id) => id !== userId)
                }
              : shift
          )
        );
      }
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  const grouped = shifts.reduce((acc, shift) => {
    if (!acc[shift.role]) acc[shift.role] = [];
    acc[shift.role].push(shift);
    return acc;
  }, {});

  return (
    <div className="volunteer-container">
      <Header />
      <h1 className="volunteer-title">Choose Your Volunteer Shifts</h1>

      <div className="date-switcher">
        {dateOptions.map(({ label, value }) => (
          <button type="button"
            key={value}
            className={value === selectedDate ? "active" : ""}
            onClick={() => setSelectedDate(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="schedule-image">
        <a href={scheduleImages[selectedDate]} target="_blank" rel="noopener noreferrer">
          <img src={scheduleImages[selectedDate]} alt={`Schedule for ${selectedDate}`} />
        </a>
      </div>

      <div className="shift-list">
        {Object.entries(grouped).map(([role, shifts]) => (
          <div key={role} className="role-card">
            <h3>{role}</h3>
            <ul>
              {shifts
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((shift) => {
                  const isSignedUp = shift.volunteersRegistered.includes(userId);
                  const available = shift.volunteersNeeded - shift.volunteersRegistered.length;
                  return (
                    <li key={shift._id}>
                      <strong>{to12Hour(shift.startTime)}–{to12Hour(shift.endTime)}</strong>:{" "}
                      {available} spot{available !== 1 ? "s" : ""} left{" "}
                      {isSignedUp ? (
                        <button type="button" onClick={() => handleCancel(shift._id)} className="cancel-btn">
                          ❌ Cancel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSignup(shift._id)}
                          disabled={available <= 0}
                        >
                          Sign Up
                        </button>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
