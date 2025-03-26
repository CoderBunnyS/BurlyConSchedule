import React, { useState, useEffect } from "react";
import "../styles/admin.css";
import Header from "./Header";
import ShiftForm from "./ShiftForm";
import ShiftRoleForm from "./ShiftRoleForm";


export default function AdminPanel() {
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    fetch("/api/shifts")
      .then((res) => res.json())
      .then((data) => setShifts(data))
      .catch((error) => console.error("Error fetching shifts:", error));
  }, []);

  const handleDeleteShift = async (shiftId) => {
    const confirm = window.confirm("Are you sure you want to delete this shift?");
    if (!confirm) return;

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
      <Header />
      <h1 className="page-title">Admin Panel - Manage Shifts</h1>

      <ShiftRoleForm onRoleCreated={(newRole) => console.log("New role added:", newRole)} />
<ShiftForm onShiftCreated={(newShift) => setShifts((prev) => [...prev, newShift])} />


      {shifts.length === 0 ? (
        <p className="page-subtitle">No shifts available</p>
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
    </div>
  );
}
