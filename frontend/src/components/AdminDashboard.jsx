import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import { hasRole } from "../utils/authUtils";
import "../styles/adminDash.css";

export default function AdminDashboard() {
  const [needsByDate, setNeedsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalShifts, setTotalShifts] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [allShiftsData, setAllShiftsData] = useState([]);
  
  // New state 
  const [expandedDepts, setExpandedDepts] = useState({});
  const [filterView, setFilterView] = useState("all"); 

  const isAdmin = hasRole("Admin");

  const dates = useMemo(
    () => ["2025-11-05", "2025-11-06", "2025-11-07", "2025-11-08", "2025-11-09"],
    []
  );
  const API_BASE = process.env.REACT_APP_API_BASE;

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const loadData = useCallback(async (opts) => {
    setLoading(true);
    setError(null);

    try {
      const requests = dates.map((date) =>
        fetch(`${API_BASE}/api/volunteer/${date}`, {
          signal: opts && opts.signal,
          credentials: "include",
          cache: "no-store",
        })
          .then(async (r) => {
            if (!r.ok) throw new Error(`GET /api/volunteer/${date} -> ${r.status}`);
            const json = await r.json();
            return { date, json };
          })
      );

      const results = await Promise.allSettled(requests);

      const allNeeds = {};
      let total = 0;
      const volunteers = new Set();
      const allShifts = [];

      results.forEach((res) => {
        if (res.status === "fulfilled") {
          const { date, json } = res.value;
          const filtered = json.filter((n) => n.volunteersNeeded > 0);
          if (filtered.length) allNeeds[date] = filtered;
          total += json.length;
              if (date === "2025-11-09") {
      console.log("Nov 9 raw data:", json);
      console.log("Nov 9 filtered:", filtered);
      console.log("Will add to needsByDate?", filtered.length > 0);
    }
          // Collect all shifts
          json.forEach((shift) => {
            allShifts.push({ ...shift, date });
            if (shift.volunteersRegistered) {
              shift.volunteersRegistered.forEach((v) => volunteers.add(v));
            }
          });
        } else {
          console.warn(res.reason);
          setError("Some data failed to load. Retrying on focus.");
        }
      });

      if (!mountedRef.current) return;

      setNeedsByDate(allNeeds);
      setTotalShifts(total);
      setVolunteerCount(volunteers.size);
      setAllShiftsData(allShifts);
    } catch (e) {
      if (opts && opts.signal && opts.signal.aborted) return;
      console.error(e);
      if (mountedRef.current) setError((e && e.message) || "Failed to load data.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [API_BASE, dates]);

  useEffect(() => {
    const c = new AbortController();
    loadData({ signal: c.signal });
    return () => c.abort();
  }, [loadData]);

  useEffect(() => {
    const onFocus = () => loadData();
    const onVis = () => { if (!document.hidden) loadData(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [loadData]);

  // shifts by department/role
  const departmentStats = useMemo(() => {
    const deptMap = {};
    
    allShiftsData.forEach((shift) => {
      const deptName = shift.role || "Unassigned";
      
      if (!deptMap[deptName]) {
        deptMap[deptName] = {
          name: deptName,
          shifts: [],
          totalCapacity: 0,
          totalFilled: 0,
          totalUnfilled: 0,
          criticalShifts: 0
        };
      }
      
      const registered = shift.volunteersRegistered?.length || 0;
      const needed = shift.volunteersNeeded || 0;
      const capacity = shift.capacity || (registered + needed);
      const filled = registered;
      
      deptMap[deptName].shifts.push({
        ...shift,
        filled,
        needed,
        capacity
      });
      
      deptMap[deptName].totalCapacity += capacity;
      deptMap[deptName].totalFilled += filled;
      deptMap[deptName].totalUnfilled += needed;
      
      if (needed > 0 && registered === 0) {
        deptMap[deptName].criticalShifts++;
      }
    });
    
    return Object.values(deptMap).sort((a, b) => b.totalUnfilled - a.totalUnfilled);
  }, [allShiftsData]);

  const totalUnfilled = useMemo(() => 
    departmentStats.reduce((sum, dept) => sum + dept.totalUnfilled, 0),
    [departmentStats]
  );

  const totalFilled = useMemo(() => 
    departmentStats.reduce((sum, dept) => sum + dept.totalFilled, 0),
    [departmentStats]
  );

  const totalCapacity = useMemo(() => 
    departmentStats.reduce((sum, dept) => sum + dept.totalCapacity, 0),
    [departmentStats]
  );

  const criticalGaps = useMemo(() => 
    departmentStats.reduce((sum, dept) => sum + dept.criticalShifts, 0),
    [departmentStats]
  );

  const coveragePercentage = totalCapacity > 0 
    ? Math.round((totalFilled / totalCapacity) * 100) 
    : 0;

  const formatDateLabel = (date) =>
    new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  const formatTime = (timeStr) => {
    const [h, m] = (timeStr || "0:00").split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const display = ((h + 11) % 12) + 1;
    return `${display}:${String(m).padStart(2, "0")} ${suffix}`;
  };

  const toggleDepartment = (deptName) => {
    setExpandedDepts(prev => ({
      ...prev,
      [deptName]: !prev[deptName]
    }));
  };

  const filteredDepartments = useMemo(() => {
    if (filterView === "critical") {
      return departmentStats.filter(d => d.criticalShifts > 0);
    }
    if (filterView === "unfilled") {
      return departmentStats.filter(d => d.totalUnfilled > 0);
    }
    return departmentStats;
  }, [departmentStats, filterView]);

  const scrollToDepartments = () => {
    const element = document.getElementById("department-breakdown");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="modern-page-container">
      <Header />

      <div className="modern-header-section">
        <div className="modern-header-content">
          <h1 className="modern-page-title">Admin Dashboard</h1>
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
            <div className="modern-summary-dashboard">
              <button 
                className="modern-summary-card gradient-purple clickable"
                onClick={() => {
                  setFilterView("all");
                  scrollToDepartments();
                }}
                style={{ cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%' }}
              >
                <div className="modern-summary-icon">📊</div>
                <div className="modern-summary-content">
                  <h3 className="modern-summary-title">Coverage</h3>
                  <p className="modern-summary-number">{coveragePercentage}%</p>
                  <p className="modern-summary-subtitle">{totalFilled} of {totalCapacity} spots filled</p>
                </div>
              </button>

              <button 
                className="modern-summary-card gradient-blue clickable"
                onClick={() => {
                  setFilterView("unfilled");
                  scrollToDepartments();
                }}
                style={{ cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%' }}
              >
                <div className="modern-summary-icon">📋</div>
                <div className="modern-summary-content">
                  <h3 className="modern-summary-title">Unfilled Shifts</h3>
                  <p className="modern-summary-number">{totalUnfilled}</p>
                  <p className="modern-summary-subtitle">Across all departments</p>
                </div>
              </button>

              <button 
                className="modern-summary-card gradient-green clickable"
                onClick={() => {
                  setFilterView("critical");
                  scrollToDepartments();
                }}
                style={{ cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%' }}
              >
                <div className="modern-summary-icon">🚨</div>
                <div className="modern-summary-content">
                  <h3 className="modern-summary-title">Critical Gaps</h3>
                  <p className="modern-summary-number">{criticalGaps}</p>
                  <p className="modern-summary-subtitle">Shifts with 0 volunteers</p>
                </div>
              </button>
            </div>

            {/* Quick Actions */}
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

            {/* Department Breakdown Section */}
            <div className="modern-alert-section" id="department-breakdown">
              <div className="modern-alert-card">
                <div className="modern-alert-header">
                  <h3 className="modern-alert-title">Department Breakdown</h3>
                  {filterView !== "all" && (
                    <button
                      onClick={() => setFilterView("all")}
                      className="modern-filter-badge"
                      style={{ cursor: 'pointer' }}
                    >
                      {filterView === "critical" ? "Showing Critical Only" : "Showing Unfilled Only"} - Clear Filter
                    </button>
                  )}
                </div>

                <div className="modern-alert-content">
                  {loading ? (
                    <div className="modern-loading-state">
                      <div className="modern-loading-spinner" />
                      <p>Loading shift data…</p>
                    </div>
                  ) : error ? (
                    <div className="modern-error-state">
                      <h4 className="modern-error-title">Couldn't load everything</h4>
                      <p className="modern-error-description">{error}</p>
                    </div>
                  ) : filteredDepartments.length === 0 ? (
                    <div className="modern-success-state">
                      <div className="modern-success-icon">✅</div>
                      <h4 className="modern-success-title">
                        {filterView === "critical" ? "No critical gaps!" : "All shifts are filled!"}
                      </h4>
                      <p className="modern-success-description">
                        {filterView === "critical" 
                          ? "Great job! No shifts are completely empty."
                          : "All volunteer positions are currently covered."}
                      </p>
                    </div>
                  ) : (
                    <div className="modern-department-grid">
                      {filteredDepartments.map((dept) => {
                        const isExpanded = expandedDepts[dept.name];
                        const percentage = dept.totalCapacity > 0 
                          ? Math.round((dept.totalFilled / dept.totalCapacity) * 100) 
                          : 0;
                        
                        return (
                          <div key={dept.name} className="modern-department-card">
                            <button
                              onClick={() => toggleDepartment(dept.name)}
                              className="modern-department-header"
                              style={{ cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%', background: 'transparent' }}
                            >
                              <div className="modern-department-title-row">
                                <div className="modern-department-name">
                                  <span className="modern-expand-icon">{isExpanded ? "▼" : "▶"}</span>
                                  <span>{dept.name}</span>
                                  {dept.criticalShifts > 0 && (
                                    <span className="modern-critical-badge">
                                      {dept.criticalShifts} critical
                                    </span>
                                  )}
                                </div>
                                <div className="modern-department-stats">
                                  <span className={`modern-status-badge ${
                                    dept.totalUnfilled === 0 ? 'filled' :
                                    dept.totalUnfilled <= 3 ? 'minor' : 'critical'
                                  }`}>
                                    {dept.totalUnfilled} open
                                  </span>
                                </div>
                              </div>
                              
                              <div className="modern-department-progress">
                                <div className="modern-progress-bar">
                                  <div 
                                    className="modern-progress-fill"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="modern-progress-text">
                                  {dept.totalFilled} of {dept.totalCapacity} spots filled
                                </span>
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="modern-department-details">
                                <h4 className="modern-details-title">Unfilled Shifts</h4>
                                {dept.shifts
                                  .filter(shift => shift.needed > 0)
                                  .sort((a, b) => b.needed - a.needed)
                                  .map((shift, idx) => {
                                    const shiftPercentage = shift.capacity > 0 
                                      ? Math.round((shift.filled / shift.capacity) * 100) 
                                      : 0;
                                    
                                    return (
                                      <div key={idx} className="modern-shift-detail">
                                        <div className="modern-shift-info">
                                          <div className="modern-shift-label">
                                            <strong>{formatDateLabel(shift.date)}</strong>
                                            <span> • {formatTime(shift.startTime)} – {formatTime(shift.endTime)}</span>
                                          </div>
                                          <span className={`modern-shift-badge ${
                                            shift.filled === 0 ? 'critical' : 
                                            shift.needed <= 2 ? 'minor' : 'warning'
                                          }`}>
                                            {shift.needed} needed
                                          </span>
                                        </div>
                                        <div className="modern-shift-progress">
                                          <div className="modern-progress-bar small">
                                            <div 
                                              className="modern-progress-fill"
                                              style={{ width: `${shiftPercentage}%` }}
                                            />
                                          </div>
                                          <span className="modern-progress-text small">
                                            {shift.filled}/{shift.capacity}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gaps by Date view */}
            <div className="modern-alert-section">
              <div className="modern-alert-card">
                <div className="modern-alert-header">
                  <h3 className="modern-alert-title">Gaps by Date</h3>
                  {totalUnfilled > 0 && (
                    <div className="modern-alert-badge">{totalUnfilled} positions needed</div>
                  )}
                </div>

                <div className="modern-alert-content">
                  {Object.keys(needsByDate).length === 0 ? (
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
                              {Array.isArray(needs)
                                ? needs.reduce((sum, n) => sum + (n.volunteersNeeded || 0), 0)
                                : 0}{" "}
                              needed
                            </div>
                          </div>

                          <div className="modern-gap-shifts">
                            {Array.isArray(needs) &&
                              needs
                                .slice()
                                .sort((a, b) => (b.volunteersNeeded || 0) - (a.volunteersNeeded || 0))
                                .map((n) => (
                                  <div key={n._id} className="modern-shift-item">
                                    <a
                                      href="https://www.burlyconvolunteers.com/admin/shifts"
                                      className={`modern-shift-pill ${(n.volunteersNeeded || 0) >= 2 ? "critical" : "minor"}`}
                                    >
                                      <span className="modern-shift-icon">
                                        {(n.volunteersNeeded || 0) >= 2 ? "🚨" : "📉"}
                                      </span>
                                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span className="modern-shift-time">
                                          {formatTime(n.startTime)}–{formatTime(n.endTime)}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#f9a8d4', fontWeight: 500 }}>
                                          {n.role || 'Role not specified'}
                                        </span>
                                      </div>
                                      <span className="modern-shift-count">({n.volunteersNeeded || 0})</span>
                                    </a>
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
      </div>
    </div>
  );
}