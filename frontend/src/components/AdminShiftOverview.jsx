import React, { useEffect, useState } from "react";
import Header from "./Header";
import ShiftForm from "./ShiftForm";
import ShiftSchedule from "./ShiftSchedule";
import "../styles/admin.css";

export default function AdminShiftOverview() {
  const [allShifts, setAllShifts] = useState([]);
  const [expandedRole, setExpandedRole] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer`)
      .then((res) => res.json())
      .then((data) => setAllShifts(data))
      .catch((err) => console.error("Error loading shifts:", err));
  }, []);

  const getRoles = () => {
    const roleSet = new Set();
    allShifts.forEach((s) => s.role && roleSet.add(s.role));
    return [...roleSet].sort();
  };

  const getShiftsByRole = (role) =>
    allShifts.filter((s) => s.role === role);

  const getStats = (shifts) => {
    let unfilled = 0;
    for (let shift of shifts) {
      const filled = shift.volunteersRegistered?.length || 0;
      if (filled < shift.volunteersNeeded) unfilled++;
    }
    return {
      total: shifts.length,
      unfilled,
      status: unfilled === 0 ? "green" : unfilled <= 2 ? "yellow" : "red",
    };
  };

  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">Shift Coverage by Role</h1>

      <div className="accordion-toggle-row">
        <details className="accordion" open={false}>
          <summary>➕ Add a New Shift</summary>
          <div className="accordion-content">
            <ShiftForm
              existingShifts={allShifts}
              onShiftCreated={(newShift) => {
                setAllShifts((prev) => [...prev, newShift]);
                setExpandedRole(newShift.role); // auto-expand that role
              }}
            />
          </div>
        </details>

        {getRoles().map((role) => {
          const shifts = getShiftsByRole(role);
          const { total, unfilled, status } = getStats(shifts);
          const isOpen = expandedRole === role;

          return (
            <details
              key={role}
              className="accordion"
              open={isOpen}
              onToggle={(e) =>
                setExpandedRole(e.target.open ? role : null)
              }
            >
              <summary>
                <div className="shift-summary-header">
                  <span className="date-label">{role}</span>
                  <div className="status-group">
                    <span
                      className="shift-status-indicator"
                      style={{
                        backgroundColor:
                          status === "green"
                            ? "#4caf50"
                            : status === "yellow"
                            ? "#ffc107"
                            : "#f44336",
                      }}
                    />
                    <span className="shift-stat-pill">
                      {unfilled} unfilled / {total} shifts
                    </span>
                  </div>
                </div>
              </summary>
              <div className="accordion-content">
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
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
