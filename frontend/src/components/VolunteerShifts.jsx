import React, { useEffect, useState } from "react";
import "../styles/volunteer.css";
import Header from "./Header";

export default function VolunteerShifts() {
  const [selectedDate, setSelectedDate] = useState("2025-11-07");
  const [hourlyNeeds, setHourlyNeeds] = useState([]);
  const [signedUpIds, setSignedUpIds] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

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
        setSignedUpIds([]);
        setTotalHours(0);
      })
      .catch((err) => console.error("Error fetching hourly needs:", err));
  }, [selectedDate]);

  const grouped = hourlyNeeds.reduce((acc, need) => {
    if (!acc[need.role]) acc[need.role] = [];
    acc[need.role].push(need);
    return acc;
  }, {});

  const to12Hour = (hourStr) => {
    const [hour, min] = hourStr.split(":").map(Number);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = ((hour + 11) % 12 + 1);
    return `${displayHour}:${min.toString().padStart(2, "0")} ${suffix}`;
  };

  const handleSignup = async (needId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/hourlyneeds/${needId}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "6811617f46ed53b3155162c3" }) // placeholder
      });

      if (res.ok) {
        setSignedUpIds((prev) => [...prev, needId]);
        setTotalHours((prev) => prev + 1);
        setHourlyNeeds((prev) =>
          prev.map((need) =>
            need._id === needId
              ? { ...need, volunteersNeeded: need.volunteersNeeded - 1 }
              : need
          )
        );
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  const handleCancel = async (needId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/hourlyneeds/${needId}/cancel`, {
        method: "POST",      
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "6811617f46ed53b3155162c3" })
      });

      if (res.ok) {
        setSignedUpIds((prev) => prev.filter((id) => id !== needId));
        setTotalHours((prev) => prev - 1);
        setHourlyNeeds((prev) =>
          prev.map((need) =>
            need._id === needId
              ? { ...need, volunteersNeeded: need.volunteersNeeded + 1 }
              : need
          )
        );
      }
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  return (
    <div className="volunteer-container">
      <Header />
      <h1 className="volunteer-title">Choose Your Volunteer Shifts</h1>

      <div className="date-switcher">
        {dateOptions.map(({ label, value }) => (
          <button type  ="button"
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

      {signedUpIds.length > 0 && (
        <div className="shift-tally">
          {(() => {
            const selectedShifts = hourlyNeeds.filter((n) => signedUpIds.includes(n._id));
            const hours = selectedShifts.map((n) => n.hour).sort();
            const start = to12Hour(hours[0]);
            const endRaw = Number.parseInt(hours[hours.length - 1].split(":")[0]) + 1;
            const end = to12Hour(`${endRaw}:00`);
            return (
              <p>
                ✅ You’re signed up from <strong>{start}</strong> to <strong>{end}</strong>{" "}
                ({signedUpIds.length} hour{signedUpIds.length > 1 ? "s" : ""})
              </p>
            );
          })()}
        </div>
      )}

      <div className="shift-list">
        {Object.entries(grouped).map(([role, needs]) => (
          <div key={role} className="role-card">
            <h3>{role}</h3>
            <ul>
              {needs.map(({ _id, hour, volunteersNeeded }) => (
                <li key={_id}>
                  <strong>{to12Hour(hour)}</strong>: {volunteersNeeded} needed{" "}
                  {signedUpIds.includes(_id) ? (
                    <button type="button" onClick={() => handleCancel(_id)} className="cancel-btn">❌ Cancel</button>
                  ) : (
                    <button type="button"
                      onClick={() => handleSignup(_id)}
                      disabled={volunteersNeeded <= 0}
                    >
                      Sign Up
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
