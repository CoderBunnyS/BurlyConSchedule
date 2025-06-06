import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import "../styles/admin.css";

export default function AdminDashboard() {
  const [needsByDate, setNeedsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalShifts, setTotalShifts] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const dates = [
    "2025-11-05",
    "2025-11-06",
    "2025-11-07",
    "2025-11-08",
    "2025-11-09",
  ];

  useEffect(() => {
    const fetchData = async () => {
      const allNeeds = {};
      let total = 0;
      let volunteers = new Set();

      for (const date of dates) {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/${date}`);
          const data = await res.json();
          const filtered = data.filter(n => n.volunteersNeeded > 0);
          if (filtered.length > 0) {
            allNeeds[date] = filtered;
          }
          total += data.length;
          data.forEach(shift => shift.volunteersRegistered?.forEach(v => volunteers.add(v)));
        } catch (err) {
          console.error("Error fetching data for", date, err);
        }
      }

      setNeedsByDate(allNeeds);
      setTotalShifts(total);
      setVolunteerCount(volunteers.size);
      setLoading(false);
    };

    fetchData();
  }, []);

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  };

  const formatTime = (hourStr) => {
    if (!hourStr || typeof hourStr !== "string" || !hourStr.includes(":")) return "";
    const [hour, min] = hourStr.split(":" ).map(Number);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = ((hour + 11) % 12) + 1;
    return `${displayHour}:${min.toString().padStart(2, "0")} ${suffix}`;
  };

  const groupByRole = (needs) => {
    const grouped = {};
    for (const n of needs) {
      if (!grouped[n.role]) grouped[n.role] = [];
      grouped[n.role].push(n);
    }
    return grouped;
  };

  const totalUnfilled = Object.values(needsByDate).flat().reduce((acc, n) => acc + n.volunteersNeeded, 0);

  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">🛠️ Admin Dashboard</h1>
      <p className="page-subtitle">
        Get a pulse on volunteer coverage and shift activity. Here’s what’s live and what needs attention.
      </p>

      <div className="summary-dashboard">
        <div className="summary-card"><h3>🟣 Volunteers Still Needed</h3><p>{totalUnfilled}</p></div>
        <div className="summary-card"><h3>📋 Total Shifts</h3><p>{totalShifts}</p></div>
        <div className="summary-card"><h3>🧍‍♀️ Total Volunteers</h3><p>{volunteerCount}</p></div>
      </div>

      <div className="alert-card">
        <h3>📋 Gaps by Role</h3>
        {loading ? (
          <p>Loading...</p>
        ) : Object.keys(needsByDate).length === 0 ? (
          <p>✅ All shifts are currently filled!</p>
        ) : (
          Object.entries(needsByDate).map(([date, needs]) => {
            const byRole = groupByRole(needs);
            return (
              <div key={date} style={{ marginBottom: "15px" }}>
                <strong>{formatDateLabel(date)}</strong>
                <ul>
                  {Object.entries(byRole).map(([role, items]) => {
                    const isUrgent = items.length >= 3;
                    const sortedItems = [...items].sort((a, b) => b.volunteersNeeded - a.volunteersNeeded);
                    return (
                      <li key={role}>
                        <strong className={isUrgent ? "urgent-role" : ""}>{role}</strong>
                        <ul className="shift-list">
                          {sortedItems.map((n) => {
                            const time = `${formatTime(n.startTime)}–${formatTime(n.endTime)}`;
                            const icon = n.volunteersNeeded >= 2 ? "🚨" : "📉";
                            const iconClass = n.volunteersNeeded >= 2 ? "critical" : "minor";
                            return (
                              <li key={n._id} className="shift-list-item">
                                <span
                                  className={`shift-label ${iconClass}`}
                                  title={n.volunteersNeeded >= 2 ? "Critical gap" : "Needs coverage"}
                                >
                                  {icon} {time} ({n.volunteersNeeded})
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </div>

      <div className="admin-links">
        <Link to="/admin/shifts" className="admin-button">📅 Manage Shifts</Link>
        <Link to="/admin/roles" className="admin-button">🛠️ Manage Volunteer Roles</Link>
        <Link to="/admin/volunteers" className="admin-button">👥 View Volunteers</Link>
        {/* <Link to="/admin/hourly-needs" className="admin-button">⏱️ Set Hourly Needs</Link> */}
      </div>
    </div>
  );
}
