import React, { useEffect, useState } from "react";
import Header from "./Header";
import ShiftSchedule from "./ShiftSchedule";
import ShiftForm from "./ShiftForm";
import "../styles/admin.css";
import { hasRole } from "../utils/authUtils";


const CON_DATES = [
  "2025-11-05", // Wednesday - setup only
  "2025-11-06", // Thursday
  "2025-11-07", // Friday
  "2025-11-08", // Saturday
  "2025-11-09"  // Sunday
];

const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

export default function AdminShiftOverview() {
  const [allShifts, setAllShifts] = useState([]);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer`)
      .then((res) => res.json())
      .then((data) => setAllShifts(data))
      .catch((err) => console.error("Error loading shifts:", err));
  }, []);

  const getShiftsByDate = (date) =>
    allShifts.filter((s) => s.date.startsWith(date));

  const getShiftStats = (shifts) => {
    let unfilled = 0;
    for (let shift of shifts) {
      const filled = shift.volunteersRegistered?.length || 0;
      if (filled < shift.volunteersNeeded) unfilled++;
    }
    return {
      total: shifts.length,
      unfilled,
      status: unfilled === 0 ? "green" : unfilled <= 2 ? "yellow" : "red"
    };
  };

  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">Shift Coverage by Day</h1>

      <div className="accordion-toggle-row">
        <details className="accordion" open={false}>
          <summary>➕ Add a New Shift</summary>
          <div className="accordion-content">
            <ShiftForm
              existingShifts={allShifts}
              onShiftCreated={(newShift) => {
                setAllShifts((prev) => [...prev, newShift]);
                setExpandedDay(newShift.date); // optional: auto-expand that day
              }}
            />
          </div>
        </details>

        {CON_DATES.map((date) => {
          const shifts = getShiftsByDate(date);
          const { total, unfilled, status } = getShiftStats(shifts);
          const isOpen = expandedDay === date;

          return (
            <details
              key={date}
              className="accordion"
              open={isOpen}
              onToggle={(e) => setExpandedDay(e.target.open ? date : null)}
            >
              <summary>
                <span style={{ marginRight: "10px" }}>{dateLabel(date)}</span>
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor:
                      status === "green" ? "#4caf50" :
                      status === "yellow" ? "#ffc107" :
                      "#f44336",
                    verticalAlign: "middle"
                  }}
                />{" "}
                <small style={{ marginLeft: "10px" }}>
                  {unfilled} unfilled / {total} shifts
                </small>
              </summary>

              <div className="accordion-content">
                {shifts.length === 0 ? (
                  <p>No shifts scheduled.</p>
                ) : (
                  <ShiftSchedule
                    shifts={shifts}
                    viewMode="admin"
                    onShiftUpdated={(updated) =>
                      setAllShifts((prev) =>
                        prev.map((s) => (s._id === updated._id ? updated : s))
                      )
                    }
                    onShiftDeleted={(deletedId) =>
                      setAllShifts((prev) =>
                        prev.filter((s) => s._id !== deletedId)
                      )
                    }
                  />
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
