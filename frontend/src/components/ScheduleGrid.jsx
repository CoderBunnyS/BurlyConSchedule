
import React from "react";
import "../styles/scheduleGrid.css";

export default function ScheduleGrid({ shifts, selectedDate, selectedRole }) {
  if (!Array.isArray(shifts)) {
    return <div className="schedule-grid-error">⚠️ Invalid shift data.</div>;
  }

  // Build a local Date from "YYYY-MM-DD" and "HH:mm" safely
  const toLocalDate = (ymd, hhmm = "00:00") => {
    if (!ymd) return null;
    const [y, m, d] = ymd.split("-").map(Number);
    const [h, min] = (hhmm || "00:00").split(":").map(Number);
    return new Date(y, m - 1, d, h, min);
  };

  const filteredShifts = shifts.filter((shift) => {
    const matchesDate = !selectedDate || shift.date === selectedDate;
    const matchesRole = selectedRole === "All" || shift.role === selectedRole;
    return matchesDate && matchesRole;
  });

  const shiftsByHour = {};

  filteredShifts.forEach((shift) => {
    if (!shift?.date || !shift?.startTime) return;

    // Use local-time construction (avoid "YYYY-MM-DDTHH:mm" → UTC parsing)
    const parsed = toLocalDate(shift.date, shift.startTime);
    if (!(parsed instanceof Date) || isNaN(parsed)) return;

    const hourLabel = parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!shiftsByHour[hourLabel]) shiftsByHour[hourLabel] = [];
    shiftsByHour[hourLabel].push(shift);
  });

  const hours = Array.from({ length: 24 }, (_, i) =>
    new Date(0, 0, 0, i).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  return (
    <div className="schedule-grid-container">
      <div className="schedule-grid">
        {hours.map((hour) => (
          <div key={hour} className="schedule-cell">
            <div className="schedule-time">{hour}</div>
            {shiftsByHour[hour] ? (
              <ul className="schedule-list">
                {shiftsByHour[hour].map((shift) => {
                  const filled = shift.volunteersRegistered?.length || 0;
                  const needed = shift.volunteersNeeded || 0;
                  const statusClass =
                    filled >= needed
                      ? "filled"
                      : filled === 0
                      ? "empty"
                      : "partial";

                  return (
                    <li key={shift._id} className={`schedule-item ${statusClass}`}>
                      <strong>{shift.role}</strong> ({filled}/{needed})
                      {filled < needed && (
                        <div className="schedule-note">
                          ❗ Needs {needed - filled} more
                        </div>
                      )}
                      {shift.notes && (
                        <div className="schedule-note">📝 {shift.notes}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="no-shift">No shifts</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

