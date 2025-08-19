// AdminDashboard.js — plain JS (no TypeScript)
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import "../styles/admin.css";

export default function AdminDashboard() {
  const [needsByDate, setNeedsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalShifts, setTotalShifts] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  }, []);
  const roles = (user && user.roles) || [];
  const isAdmin = roles.includes("admin");

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

      results.forEach((res) => {
        if (res.status === "fulfilled") {
          const { date, json } = res.value;
          const filtered = json.filter((n) => n.volunteersNeeded > 0);
          if (filtered.length) allNeeds[date] = filtered;
          total += json.length;
          json.forEach((n) => n.volunteersRegistered && n.volunteersRegistered.forEach((v) => volunteers.add(v)));
        } else {
          console.warn(res.reason);
          if (!error) setError("Some data failed to load. Retrying on focus.");
        }
      });

      if (!mountedRef.current) return;

      setNeedsByDate(allNeeds);
      setTotalShifts(total);
      setVolunteerCount(volunteers.size);
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

  const formatDateLabel = (date) =>
    new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  const formatTime = (timeStr) => {
    const [h, m] = (timeStr || "0:00").split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const display = ((h + 11) % 12) + 1;
    return `${display}:${String(m).padStart(2, "0")} ${suffix}`;
  };

  const totalUnfilled = Object.values(needsByDate)
    .flat()
    .reduce((sum, n) => sum + (n.volunteersNeeded || 0), 0);

  return (
    <div className="modern-page-container">
      <Header />

      <div className="modern-header-section">
        <div className="modern-header-content">
          <h1 className="modern-page-title">Admin Dashboard</h1>
          {isAdmin && (
            <p className="modern-page-subtitle">
              Get a pulse on volunteer coverage and shift activity. Here’s what’s live and what needs attention.
            </p>
          )}
        </div>
      </div>

      <div className="modern-content-wrapper">
        {isAdmin && (
          <>
            <div className="modern-summary-dashboard">
              <div className="modern-summary-card gradient-purple">
                <div className="modern-summary-icon">●</div>
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

            <div className="modern-alert-section">
              <div className="modern-alert-card">
                <div className="modern-alert-header">
                  <h3 className="modern-alert-title">Gaps by Role</h3>
                  {totalUnfilled > 0 && (
                    <div className="modern-alert-badge">{totalUnfilled} positions needed</div>
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
                      <h4 className="modern-error-title">Couldn’t load everything</h4>
                      <p className="modern-error-description">
                        {error} Try switching tabs or clicking back into the window to retry.
                      </p>
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
                                    <div className={`modern-shift-pill ${(n.volunteersNeeded || 0) >= 2 ? "critical" : "minor"}`}>
                                      <span className="modern-shift-icon">
                                        {(n.volunteersNeeded || 0) >= 2 ? "🚨" : "📉"}
                                      </span>
                                      <span className="modern-shift-time">
                                        {formatTime(n.startTime)}–{formatTime(n.endTime)}
                                      </span>
                                      <span className="modern-shift-count">({n.volunteersNeeded || 0})</span>
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
