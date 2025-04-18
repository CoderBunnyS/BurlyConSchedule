import React, { useState, useEffect } from "react";
import "../styles/admin.css";
import Header from "./Header";
import ShiftForm from "./ShiftForm";
import ShiftRoleForm from "./ShiftRoleForm";

export default function AdminPanel() {
  const [shifts, setShifts] = useState([]);
  const [stats, setStats] = useState({
    totalShifts: 0,
    spotsFilled: 0,
    spotsRemaining: 0,
  });

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/shifts`)
      .then((res) => res.json())
      .then((data) => {
        setShifts(data);
        calculateStats(data);
      })
      .catch((error) => console.error("Error fetching shifts:", error));
  }, []);

  const calculateStats = (shiftData) => {
    const totalShifts = shiftData.length;
    const spotsFilled = shiftData.reduce((sum, shift) => sum + (shift.volunteersRegistered?.length || 0), 0);
    const spotsAvailable = shiftData.reduce((sum, shift) => sum + shift.volunteersNeeded, 0);
    const spotsRemaining = spotsAvailable - spotsFilled;

    setStats({ totalShifts, spotsFilled, spotsRemaining });
  };

  const handleDeleteShift = async (shiftId) => {
    const confirm = window.confirm("Are you sure you want to delete this shift?");
    if (!confirm) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/shifts/${shiftId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedShifts = shifts.filter((shift) => shift._id !== shiftId);
        setShifts(updatedShifts);
        calculateStats(updatedShifts);
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

      {/* ✅ Summary Dashboard */}
      <div className="summary-dashboard">
        <div className="summary-card">
          <h3>Total Shifts</h3>
          <p>{stats.totalShifts}</p>
        </div>
        <div className="summary-card">
          <h3>Spots Filled</h3>
          <p>{stats.spotsFilled}</p>
        </div>
        <div className="summary-card">
          <h3>Spots Remaining</h3>
          <p>{stats.spotsRemaining}</p>
        </div>
      </div>

      {/* ✅ Scheduled Shift List */}
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
              <p><strong>Time:</strong> {shift.startTime} – {shift.endTime}</p>
              <p><strong>Description:</strong> {shift.taskDescription}</p>
              <p><strong>Needed:</strong> {shift.volunteersNeeded}</p>
              <p><strong>Signed Up:</strong> {shift.volunteersRegistered?.length || 0}</p>
              <p><strong>Spots Available:</strong> {shift.volunteersNeeded - (shift.volunteersRegistered?.length || 0)}</p>

              <div className="shift-card-buttons">
                <button type="button" onClick={() => alert("TODO: View Volunteers")}>
                  👥 View Volunteers
                </button>
                <button type="button" onClick={() => handleDeleteShift(shift._id)}>
                  ❌ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* ✅ Accordion: Add Shift */}
      <div className="accordion-toggle-row">
  <details className="accordion">
    <summary>➕ Schedule a New Shift</summary>
    <div className="accordion-content">
      <ShiftForm onShiftCreated={(newShift) => {
        const updated = [...shifts, newShift];
        setShifts(updated);
        calculateStats(updated);
      }} />
    </div>
  </details>

  <details className="accordion">
    <summary>➕ Define a New Volunteer Role</summary>
    <div className="accordion-content">
      <ShiftRoleForm onRoleCreated={(newRole) => console.log("Role created:", newRole)} />
    </div>
  </details>
</div>
    </div>
  );
}
