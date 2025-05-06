import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import "../styles/admin.css";

export default function AdminDashboard() {
  // Placeholder stats - wire up with live data later
  const unfilledShifts = 12;
  const shiftsToday = 6;
  const leadsNeeded = 2;

  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">
        Welcome! Here’s a quick overview of volunteer operations.
      </p>

      <div className="summary-dashboard">
        <div className="summary-card">
          <h3>🟣 Unfilled Shifts</h3>
          <p>{unfilledShifts}</p>
        </div>
        <div className="summary-card">
          <h3>🕒 Shifts Today</h3>
          <p>{shiftsToday}</p>
        </div>
        <div className="summary-card">
          <h3>⭐ Leads Needed</h3>
          <p>{leadsNeeded}</p>
        </div>
      </div>

      <div className="alert-card">
        <h3>⚠️ Attention Needed</h3>
        <p>There are shifts starting tomorrow with no volunteers assigned. Consider reaching out to backups.</p>
      </div>

      <div className="admin-links">
      <div className="admin-links">
  <Link to="/admin/shifts" className="admin-button">📅 Manage Shifts</Link>
  <Link to="/admin/roles" className="admin-button">🛠️ Manage Volunteer Roles</Link>
  <Link to="/admin/volunteers" className="admin-button">👥 View Volunteers</Link>
  <Link to="/admin/hourly-needs" className="admin-button">⏱️ Set Hourly Needs</Link>
</div>

      </div>
    </div>
  );
}
