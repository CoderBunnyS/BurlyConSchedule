import React, { useEffect, useState } from "react";
import Header from "./Header";
import "../styles/admin.css";

export default function AdminShifts() {
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/shifts`)
      .then((res) => res.json())
      .then((data) => setShifts(data))
      .catch((err) => console.error("Error fetching shifts:", err));
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this shift?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/shifts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setShifts((prev) => prev.filter((shift) => shift._id !== id));
      } else {
        console.error("Failed to delete shift");
      }
    } catch (err) {
      console.error("Error deleting shift:", err);
    }
  };

  // Group shifts by date
  const groupedShifts = shifts.reduce((acc, shift) => {
    const date = shift.date.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(shift);
    return acc;
  }, {});

  const formattedDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">Manage Volunteer Shifts</h1>

      {Object.keys(groupedShifts).length === 0 ? (
        <p className="page-subtitle">No shifts have been scheduled.</p>
      ) : (
        Object.entries(groupedShifts).map(([date, shiftsOnDay]) => (
          <div key={date} className="shift-date-group">
            <h2 className="shift-date-heading">📅 {formattedDate(date)}</h2>
            {shiftsOnDay.map((shift) => {
              const filled = shift.volunteersRegistered?.length || 0;
              const needed = shift.volunteersNeeded;
              const remaining = needed - filled;
              return (
                <div key={shift._id} className="shift-card">
                  <h3>{shift.role}</h3>
                  <p>
                    <strong>Time:</strong> {shift.startTime} – {shift.endTime}
                  </p>
                  <p>
                    <strong>Volunteers:</strong> {filled} / {needed}{" "}
                    {remaining > 0 ? `– Needs ${remaining} more` : "✅ Full"}
                  </p>
                  <div className="shift-card-buttons">
                  <button type="button" onClick={() => alert("Edit shift coming soon")}>✏️ Edit</button>
                  <button type="button" onClick={() => alert("View volunteers coming soon")}>👥 View</button>
                  <button type="button" onClick={() => handleDelete(shift._id)}>❌ Delete</button>

                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}