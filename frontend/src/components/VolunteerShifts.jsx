import React, { useEffect, useState } from "react";
import "../styles/volunteer.css";
import Header from "./Header";

export default function VolunteerShifts() {
  const [selectedDate, setSelectedDate] = useState("2025-11-07");
  const [hourlyNeeds, setHourlyNeeds] = useState([]);

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

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/hourlyneeds/${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        setHourlyNeeds(data);
      })
      .catch((err) => console.error("Error fetching hourly needs:", err));
  }, [selectedDate]);

  // Group needs by role, then by hour
  const grouped = hourlyNeeds.reduce((acc, need) => {
    if (!acc[need.role]) acc[need.role] = [];
    acc[need.role].push(need);
    return acc;
  }, {});

  const handleSignup = async (needId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/hourlyneeds/${needId}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "6811617f46ed53b3155162c3" }) // temp placeholder
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert("Signed up!");
        // Refresh the needs list
        setHourlyNeeds((prev) =>
          prev.map((need) =>
            need._id === needId ? { ...need, volunteersNeeded: need.volunteersNeeded - 1 } : need
          )
        );
      } else {
        alert(`Could not sign up: ${data.message}`);
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };
  

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
        {Object.keys(grouped).length > 0 ? (
          Object.entries(grouped).map(([role, needs]) => (
            <div key={role} className="role-card">
              <h3>{role}</h3>
              <ul>
  {needs.map(({ _id, hour, volunteersNeeded }) => (
    <li key={_id}>
      <strong>{hour}</strong>: {volunteersNeeded} needed{" "}
      <button type="button"
        onClick={() => handleSignup(_id)}
        disabled={volunteersNeeded <= 0}
      >
        Sign Up
      </button>
    </li>
  ))}
</ul>

            </div>
          ))
        ) : (
          <p>No shifts available for this day.</p>
        )}
      </div>
    </div>
  );
}
