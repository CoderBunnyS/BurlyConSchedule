import React, { useEffect, useState } from "react";
import Header from "./Header";
import "../styles/admin.css";
import { hasRole } from "../utils/authUtils";

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("hours"); // "hours", "name", "shifts"

  // Check user roles
  const isAdmin = hasRole("Admin");
  const isLead = hasRole("Lead");
  const canAccessPage = isAdmin || isLead;

  useEffect(() => {
    // Only fetch data if user has access
    if (!canAccessPage) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE}/api/admin/volunteers`)
      .then((res) => res.json())
      .then((data) => {
        setVolunteers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching volunteers:", err);
        setLoading(false);
      });
  }, [canAccessPage]);

  const filteredVolunteers = volunteers.filter((vol) =>
    vol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vol.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedVolunteers = [...filteredVolunteers].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "hours":
        return (b.totalHours || 0) - (a.totalHours || 0);
      case "shifts":
        return (b.shifts?.length || 0) - (a.shifts?.length || 0);
      default:
        return 0;
    }
  });

  const formatTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":")) return timeStr;
    const [hour, min] = timeStr.split(":");
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const displayHour = ((h + 11) % 12) + 1;
    return `${displayHour}:${min} ${suffix}`;
  };

  const totalVolunteers = volunteers.length;
  const totalHours = volunteers.reduce((sum, vol) => sum + (vol.totalHours || 0), 0);
  const activeVolunteers = volunteers.filter(vol => (vol.shifts?.length || 0) > 0).length;

  // Show access denied screen for unauthorized users
  if (!canAccessPage) {
    return (
      <div className="modern-page-container">
        <Header />
        <div className="modern-header-section">
          <div className="modern-header-content">
            <h1 className="modern-page-title">🔒 Access Restricted</h1>
            <p className="modern-page-subtitle">
              You don't have permission to view the volunteer roster
            </p>
          </div>
        </div>
        <div className="modern-content-wrapper">
          <div className="modern-empty-state">
            <div className="modern-empty-icon">🚫</div>
            <h3 className="modern-empty-title">Access Denied</h3>
            <p className="modern-empty-description">
              Only administrators and leads can access the volunteer roster. 
              Please contact an admin if you need access to this page.
            </p>
            <a href="/" className="modern-empty-action">
              <span className="modern-button-icon">🏠</span>
              Return Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-page-container">
      <Header />
      
      {/* Header Section */}
      <div className="modern-header-section">
        <div className="modern-header-content">
          <h1 className="modern-page-title">👥 Volunteer Roster</h1>
          <p className="modern-page-subtitle">
            Manage and monitor your volunteer community
          </p>
        </div>
      </div>

      <div className="modern-content-wrapper">
        {/* Summary Stats - Admin Only */}
        {isAdmin && (
          <div className="modern-summary-dashboard">
            <div className="modern-summary-card gradient-blue">
              <div className="modern-summary-icon">👥</div>
              <div className="modern-summary-content">
                <div className="modern-summary-number">{totalVolunteers}</div>
                <div className="modern-summary-title">Total Volunteers</div>
              </div>
            </div>
            
            <div className="modern-summary-card gradient-green">
              <div className="modern-summary-icon">✨</div>
              <div className="modern-summary-content">
                <div className="modern-summary-number">{activeVolunteers}</div>
                <div className="modern-summary-title">Active Volunteers</div>
              </div>
            </div>
            
            <div className="modern-summary-card gradient-purple">
              <div className="modern-summary-icon">⏰</div>
              <div className="modern-summary-content">
                <div className="modern-summary-number">{totalHours}</div>
                <div className="modern-summary-title">Total Hours</div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="modern-filter-section">
          <div className="modern-filter-header">
            <h3 className="modern-filter-title">
              📋 {filteredVolunteers.length} Volunteer{filteredVolunteers.length !== 1 ? 's' : ''} Found
            </h3>
            <div className="modern-filter-controls">
              <div className="modern-search-container">
                <input
                  type="text"
                  placeholder="🔍 Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-search-input"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="modern-clear-search"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="modern-sort-select"
              >
                <option value="hours">Sort by Hours</option>
                <option value="name">Sort by Name</option>
                <option value="shifts">Sort by Shifts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Volunteers List */}
        <div className="modern-volunteers-section">
          {loading ? (
            <div className="modern-loading-state">
              <div className="modern-loading-spinner"></div>
              <p>Loading volunteer roster...</p>
            </div>
          ) : sortedVolunteers.length === 0 ? (
            <div className="modern-empty-state">
              <div className="modern-empty-icon">👥</div>
              <h3 className="modern-empty-title">
                {searchTerm ? "No matching volunteers found" : "No volunteers yet"}
              </h3>
              <p className="modern-empty-description">
                {searchTerm 
                  ? `No volunteers match "${searchTerm}". Try a different search term.`
                  : "Volunteers will appear here once they sign up for shifts."
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="modern-empty-action"
                >
                  <span className="modern-button-icon">🔍</span>
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="modern-volunteers-grid">
              {sortedVolunteers.map((vol) => (
                <div key={vol.id} className="modern-volunteer-card">
                  <div className="modern-volunteer-header">
                    <div className="modern-volunteer-avatar">
                      {vol.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="modern-volunteer-info">
                      <h3 className="modern-volunteer-name">{vol.name}</h3>
                      <p className="modern-volunteer-email">📧 {vol.email}</p>
                    </div>
                    <div className="modern-volunteer-stats">
                      <div className="modern-stat-item">
                        <span className="modern-stat-number">{vol.totalHours || 0}</span>
                        <span className="modern-stat-label">hours</span>
                      </div>
                      <div className="modern-stat-item">
                        <span className="modern-stat-number">{vol.shifts?.length || 0}</span>
                        <span className="modern-stat-label">shifts</span>
                      </div>
                    </div>
                  </div>

                  {vol.shifts && vol.shifts.length > 0 && (
                    <div className="modern-volunteer-shifts">
                      <h4 className="modern-shifts-title">
                        📅 Upcoming Shifts ({vol.shifts.length})
                      </h4>
                      <div className="modern-shifts-list">
                        {vol.shifts
                          .sort((a, b) => new Date(a.date) - new Date(b.date))
                          .map((shift) => (
                            <div key={shift.id} className="modern-shift-item">
                              <div className="modern-shift-role">
                                <span className="modern-role-name">{shift.role}</span>
                              </div>
                              <div className="modern-shift-details">
                                <span className="modern-shift-date">
                                  {new Date(shift.date).toLocaleDateString(undefined, {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric"
                                  })}
                                </span>
                                <span className="modern-shift-time">
                                  🕒 {formatTime(shift.startTime)}–{formatTime(shift.endTime)}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {(!vol.shifts || vol.shifts.length === 0) && (
                    <div className="modern-no-shifts">
                      <span className="modern-no-shifts-icon">📅</span>
                      <span className="modern-no-shifts-text">No upcoming shifts</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}