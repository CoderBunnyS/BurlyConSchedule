import React, { useState, useEffect } from "react";
import "../styles/volunteer.css";
import ShiftCard from "./ShiftCard";
import Header from "./Header";

export default function VolunteerShifts() {
  const [selectedDate, setSelectedDate] = useState("2025-11-07"); // default: Thursday
  const [shifts, setShifts] = useState([]);

  const dateOptions = [
    { label: "Thurs 11/5", value: "2025-11-05" },
    { label: "Fri 11/6", value: "2025-11-06" },
    { label: "Sat 11/7", value: "2025-11-07" },
    { label: "Sun 11/8", value: "2025-11-08" },
  ];

  const scheduleImages = {
    "2025-11-05": "https://i.ibb.co/spkQFTwf/Thursday.png",
    "2025-11-06": "https://burlycon.org/wp-content/uploads/2024/10/friday-2024.png",
    "2025-11-07": "https://burlycon.org/wp-content/uploads/2024/10/saturday-2024.png",
    "2025-11-08": "https://burlycon.org/wp-content/uploads/2024/10/sunday-2024.png",
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/shifts`)
      .then((res) => res.json())
      .then((data) => {
        // Filter shifts for selected date
        const filtered = data.filter((shift) => shift.date.startsWith(selectedDate));
        setShifts(filtered);
      })
      .catch((err) => console.error("Error loading shifts:", err));
  }, [selectedDate]);

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
        {shifts.length > 0 ? (
          shifts.map((shift) => <ShiftCard key={shift._id} shift={shift} />)
        ) : (
          <p>No volunteer shifts available for this day.</p>
        )}
      </div>
    </div>
  );
}
