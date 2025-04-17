import React, { useState, useEffect } from "react";
import "../styles/admin.css";
import Header from "./Header";
import ShiftForm from "./ShiftForm";
import ShiftRoleForm from "./ShiftRoleForm";

export default function AdminPanel() {
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/api/shifts")
      .then((res) => res.json())
      .then((data) => setShifts(data))
      .catch((error) => console.error("Error fetching shifts:", error));
  }, []);

  const handleDeleteShift = async (shiftId) => {
    const confirm = window.confirm("Are you sure you want to delete this shift?");
    if (!confirm) return;

    try {
      const response = await fetch(`http://localhost:5001/api/shifts/${shiftId}`, {
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
      <Header />
      <h1 className="page-title">Admin Panel - Manage Volunteer Shifts</h1>

      <section className="info-section">
        <h2 className="section-heading">Currently Scheduled Shifts</h2>
        {shifts.length === 0 ? (
          <p>No shifts have been scheduled yet.</p>
        ) : (
          shifts.map((shift) => (
            <div key={shift._id} className="shift-card">
              <h3>{shift.role}</h3>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(shift.date).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p>
                <strong>Time:</strong> {shift.startTime} – {shift.endTime}
              </p>
              <p>
                <strong>Description:</strong> {shift.taskDescription}
              </p>
              <p>
                <strong>Needed:</strong> {shift.volunteersNeeded}
              </p>
              <p>
                <strong>Signed Up:</strong>{" "}
                {shift.volunteersRegistered?.length || 0}
              </p>
              <p>
                <strong>Spots Available:</strong>{" "}
                {shift.volunteersNeeded - (shift.volunteersRegistered?.length || 0)}
              </p>

              <div className="shift-card-buttons">
                <button onClick={() => alert("TODO: View Volunteers")}>
                  👥 View Volunteers
                </button>
                <button onClick={() => handleDeleteShift(shift._id)}>
                  ❌ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="form-section">
        <h2>Schedule a New Shift</h2>
        <ShiftForm onShiftCreated={(newShift) => setShifts((prev) => [...prev, newShift])} />
      </section>

      <section className="form-section">
        <h2>Define a New Volunteer Role</h2>
        <ShiftRoleForm onRoleCreated={(newRole) => console.log("Role created:", newRole)} />
      </section>
    </div>
  );
}
