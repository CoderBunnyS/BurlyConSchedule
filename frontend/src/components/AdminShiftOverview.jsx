import React, { useEffect, useState } from "react";
import Header from "./Header";
import ShiftForm from "./ShiftForm";
import "../styles/admin.css";
import "../styles/scheduleGrid.css";

export default function AdminShiftOverview() {
  const [allShifts, setAllShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer`)
      .then((res) => res.json())
      .then((data) => setAllShifts(data))
      .catch((err) => console.error("Error loading shifts:", err));
  }, []);

  const roles = Array.from(new Set(allShifts.map((s) => s.role))).sort();

  const availableDates = Array.from(
    new Set(
      allShifts
        .filter((s) => !!s.date)
        .map((s) => s.date.split("T")[0])
    )
  ).sort();

  const filteredShifts = allShifts.filter((shift) => {
    const normalizedShiftDate = shift.date.split("T")[0];
    const matchesDate = !selectedDate || normalizedShiftDate === selectedDate;
    return matchesDate;
  });

  const shiftsByRole = {};
  filteredShifts.forEach((shift) => {
    if (!shiftsByRole[shift.role]) shiftsByRole[shift.role] = [];
    shiftsByRole[shift.role].push(shift);
  });

  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">Shift Coverage by Role</h1>

      <details className="accordion" open={false}>
        <summary>➕ Add a New Shift</summary>
        <div className="accordion-content">
          <ShiftForm
            existingShifts={allShifts}
            onShiftCreated={(newShift) => {
              setAllShifts((prev) => [...prev, newShift]);
            }}
          />
        </div>
      </details>

      <div className="filter-bar sticky-top">
        <label>
          Select Date:
          <select
            value={selectedDate || ""}
            onChange={(e) => setSelectedDate(e.target.value || null)}
          >
            <option value="">All Dates</option>
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="role-accordion-container">
        {Object.entries(shiftsByRole).map(([role, shifts]) => (
          <details key={role} className="accordion" open>
            <summary className="accordion-header">
              {role} ({shifts.length} shift{shifts.length > 1 ? "s" : ""})
            </summary>
            <div className="accordion-content">
              {shifts.map((shift) => {
                const filled = shift.volunteersRegistered?.length || 0;
                const needed = shift.volunteersNeeded || 0;
                const statusClass =
                  filled >= needed
                    ? "filled"
                    : filled === 0
                    ? "empty"
                    : "partial";

                return (
                  <div key={shift._id} className={`shift-card ${statusClass}`}>
                    <strong>
                      {new Date(shift.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }) + " at " + shift.startTime}
                    </strong>
                    <div>
                      {filled}/{needed} filled
                    </div>
                    {filled < needed && (
                      <div className="schedule-note">
                        ❗ Needs {needed - filled} more
                      </div>
                    )}
                    {shift.notes && (
                      <div className="schedule-note">📝 {shift.notes}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
