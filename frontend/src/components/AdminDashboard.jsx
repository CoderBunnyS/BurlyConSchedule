import React, { useEffect, useState } from "react";
import Header from "./Header";
import "../styles/admin.css";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [shifts, setShifts] = useState([]);
  const [roles, setRoles] = useState([]);

  const [stats, setStats] = useState({
    totalShifts: 0,
    totalRoles: 0,
    totalVolunteers: 0,
    shiftsNeedingHelp: 0,
    mostUnderstaffed: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shiftRes = await fetch(`${process.env.REACT_APP_API_BASE}/api/shifts`);
        const roleRes = await fetch(`${process.env.REACT_APP_API_BASE}/api/shiftroles`);
        const shiftData = await shiftRes.json();
        const roleData = await roleRes.json();

        setShifts(shiftData);
        setRoles(roleData);

        const totalShifts = shiftData.length;
        const totalRoles = roleData.length;
        const totalVolunteers = shiftData.reduce(
          (sum, shift) => sum + (shift.volunteersRegistered?.length || 0),
          0
        );
        const shiftsNeedingHelp = shiftData.filter(
          (shift) =>
            (shift.volunteersRegistered?.length || 0) < shift.volunteersNeeded
        );

        const mostUnderstaffed = shiftsNeedingHelp.reduce((worst, current) => {
          const needed = current.volunteersNeeded - (current.volunteersRegistered?.length || 0);
          const worstNeeded = worst
            ? worst.volunteersNeeded - (worst.volunteersRegistered?.length || 0)
            : 0;
          return needed > worstNeeded ? current : worst;
        }, null);

        setStats({
          totalShifts,
          totalRoles,
          totalVolunteers,
          shiftsNeedingHelp: shiftsNeedingHelp.length,
          mostUnderstaffed,
        });
      } catch (err) {
        console.error("Failed to load admin dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">
        Welcome to BurlyCon Volunteer Management. Here's where the glitter meets the grid.
      </p>

      <div className="summary-dashboard">
        <div className="summary-card">
          <h3>Total Shifts</h3>
          <p>{stats.totalShifts}</p>
        </div>
        <div className="summary-card">
          <h3>Total Roles</h3>
          <p>{stats.totalRoles}</p>
        </div>
        <div className="summary-card">
          <h3>Total Signups</h3>
          <p>{stats.totalVolunteers}</p>
        </div>
        <div className="summary-card">
          <h3>Shifts Needing Help</h3>
          <p>{stats.shiftsNeedingHelp}</p>
        </div>
      </div>

      {stats.mostUnderstaffed && (
        <div className="alert-card">
          <h3>🚨 Most Understaffed Shift</h3>
          <p>
            <strong>{stats.mostUnderstaffed.role}</strong><br />
            {new Date(stats.mostUnderstaffed.date).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}{" "}
            — {stats.mostUnderstaffed.startTime} to {stats.mostUnderstaffed.endTime}<br />
            <strong>
              Needs{" "}
              {stats.mostUnderstaffed.volunteersNeeded -
                (stats.mostUnderstaffed.volunteersRegistered?.length || 0)}{" "}
              more volunteer(s)
            </strong>
          </p>
        </div>
      )}

      <div className="admin-links">
        <Link to="/admin/shifts" className="admin-button">📅 Manage Shifts</Link>
        <Link to="/admin/roles" className="admin-button">🛠️ Manage Roles</Link>
        {/* <Link to="/admin/volunteers" className="admin-button">👥 View Volunteers</Link> */}
      </div>
    </div>
  );
}
