import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import "../styles/admin.css"; // Updated to use the same CSS file

export default function AdminDashboard() {
  const [needsByDate, setNeedsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalShifts, setTotalShifts] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const roles = user?.roles || [];
  const isAdmin = roles.includes("admin");

  const dates = ["2025-11-05", "2025-11-06", "2025-11-07", "2025-11-08", "2025-11-09"];

  useEffect(() => {
    const fetchData = async () => {
      const allNeeds = {};
      let total = 0;
      let volunteers = new Set();

      for (const date of dates) {
        const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/${date}`);
        const data = await res.json();
        const filtered = data.filter(n => n.volunteersNeeded > 0);
        if (filtered.length) allNeeds[date] = filtered;
        total += data.length;
        data.forEach(n => n.volunteersRegistered?.forEach(v => volunteers.add(v)));
      }

      setNeedsByDate(allNeeds);
      setTotalShifts(total);
      setVolunteerCount(volunteers.size);
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatDateLabel = date =>
    new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  const formatTime = timeStr => {
    const [h, m] = timeStr.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const display = ((h + 11) % 12) + 1;
    return `${display}:${m.toString().padStart(2, "0")} ${suffix}`;
  };

  const totalUnfilled = Object.values(needsByDate)
    .flat()
    .reduce((sum, n) => sum + n.volunteersNeeded, 0);

  return (
    <div className="modern-page-container">
      <Header />
      
      {/* Modern Header Section */}
      <div className="modern-header-section">
        <div className="modern-header-content">
          <h1 className="modern-page-title">🛠️ Admin Dashboard</h1>
          {isAdmin && (
            <p className="modern-page-subtitle">
              Get a pulse on volunteer coverage and shift activity. Here's what's live and what needs attention.
            </p>
          )}
        </div>
      </div>

      <div className="modern-content-wrapper">
        {isAdmin && (
          <>
            {/* Summary Statistics */}
            <div className="modern-summary-dashboard">
              <div className="modern-summary-card gradient-purple">
                <div className="modern-summary-icon">🟣</div>
                <div className="modern-summary-content">
                  <h3 className="modern-summary-title">Volunteers Still Needed</h3>
                  <p className="modern-summary-number">{totalUnfilled}</p>
                </div>
              </div>
              
              <div className="modern-summary-card gradient-blue">
                <div className="modern-summary-icon">📋</div>
                <div className="modern-summary-content">
                  <h3 className="modern-summary-title">Total Shifts</h3>
                  <p className="modern-summary-number">{totalShifts}</p>
                </div>
              </div>
              
              <div className="modern-summary-card gradient-green">
                <div className="modern-summary-icon">🧍‍♀️</div>
                <div className="modern-summary-content">
                  <h3 className="modern-summary-title">Total Volunteers</h3>
                  <p className="modern-summary-number">{volunteerCount}</p>
                </div>
              </div>
            </div>

            {/* Gaps Alert Section */}
            <div className="modern-alert-section">
              <div className="modern-alert-card">
                <div className="modern-alert-header">
                  <h3 className="modern-alert-title">📋 Gaps by Role</h3>
                  {totalUnfilled > 0 && (
                    <div className="modern-alert-badge">
                      {totalUnfilled} positions needed
                    </div>
                  )}
                </div>
                
                <div className="modern-alert-content">
                  {loading ? (
                    <div className="modern-loading-state">
                      <div className="modern-loading-spinner"></div>
                      <p>Loading shift data...</p>
                    </div>
                  ) : Object.keys(needsByDate).length === 0 ? (
                    <div className="modern-success-state">
                      <div className="modern-success-icon">✅</div>
                      <h4 className="modern-success-title">All shifts are filled!</h4>
                      <p className="modern-success-description">
                        Great job! All volunteer positions are currently covered.
                      </p>
                    </div>
                  ) : (
                    <div className="modern-gaps-grid">
                      {Object.entries(needsByDate).map(([date, needs]) => (
                        <div key={date} className="modern-gap-card">
                          <div className="modern-gap-header">
                            <h4 className="modern-gap-date">{formatDateLabel(date)}</h4>
                            <div className="modern-gap-count">
                              {needs.reduce((sum, n) => sum + n.volunteersNeeded, 0)} needed
                            </div>
                          </div>
                          
                          <div className="modern-gap-shifts">
                            {needs
                              .sort((a, b) => b.volunteersNeeded - a.volunteersNeeded)
                              .map(n => (
                                <div key={n._id} className="modern-shift-item">
                                  <div className={`modern-shift-pill ${n.volunteersNeeded >= 2 ? "critical" : "minor"}`}>
                                    <span className="modern-shift-icon">
                                      {n.volunteersNeeded >= 2 ? "🚨" : "📉"}
                                    </span>
                                    <span className="modern-shift-time">
                                      {formatTime(n.startTime)}–{formatTime(n.endTime)}
                                    </span>
                                    <span className="modern-shift-count">
                                      ({n.volunteersNeeded})
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Admin Navigation Links */}
        <div className="modern-admin-navigation">
          <h2 className="modern-section-title">Quick Actions</h2>
          <div className="modern-admin-links">
            <Link to="/admin/shifts" className="modern-nav-link shifts">
              <div className="modern-nav-icon">📅</div>
              <div className="modern-nav-content">
                <h3 className="modern-nav-title">Manage Shifts</h3>
                <p className="modern-nav-description">Create and edit volunteer shifts</p>
              </div>
              <div className="modern-nav-arrow">→</div>
            </Link>
            
            <Link to="/admin/roles" className="modern-nav-link roles">
              <div className="modern-nav-icon">🛠️</div>
              <div className="modern-nav-content">
                <h3 className="modern-nav-title">Manage Volunteer Roles</h3>
                <p className="modern-nav-description">Define volunteer positions and requirements</p>
              </div>
              <div className="modern-nav-arrow">→</div>
            </Link>
            
            <Link to="/admin/volunteers" className="modern-nav-link volunteers">
              <div className="modern-nav-icon">👥</div>
              <div className="modern-nav-content">
                <h3 className="modern-nav-title">View Volunteers</h3>
                <p className="modern-nav-description">See registered volunteers and assignments</p>
              </div>
              <div className="modern-nav-arrow">→</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}