import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import { hasRole, getUserId } from "../utils/authUtils";
import "../styles/adminLanding.css";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function AdminLanding() {
  const [stats, setStats] = useState([]);
  const [pinnedRoles, setPinnedRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const isAdmin = hasRole("Admin");
  const isLead = hasRole("Lead");

  useEffect(() => {
    const id = getUserId();
    if (id) setUserId(id);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statsRes = await fetch(`${API_BASE}/api/dashboard/role-stats`);
      if (!statsRes.ok) throw new Error(`Stats: ${statsRes.status}`);
      const statsData = await statsRes.json();
      setStats(statsData);

      if (userId) {
        const userRes = await fetch(`${API_BASE}/api/users/${userId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setPinnedRoles(userData.pinnedRoles || []);
        }
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId !== null) loadData();
  }, [userId, loadData]);

  const togglePin = async (roleName) => {
    if (!userId) return;
    const newPinned = pinnedRoles.includes(roleName)
      ? pinnedRoles.filter((r) => r !== roleName)
      : [...pinnedRoles, roleName];

    // Optimistic update
    setPinnedRoles(newPinned);

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/pinned-roles`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinnedRoles: newPinned }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      console.error("Failed to update pinned roles:", e);
      // Revert
      setPinnedRoles(pinnedRoles);
    }
  };

  // Sort: pinned first (alphabetized), then unpinned (alphabetized)
  const sortedStats = [...stats].sort((a, b) => {
    const aPinned = pinnedRoles.includes(a.roleName);
    const bPinned = pinnedRoles.includes(b.roleName);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return a.roleName.localeCompare(b.roleName);
  });

  const hasPinned = pinnedRoles.length > 0;

  if (!isAdmin && !isLead) {
    return (
      <div className="modern-page-container">
        <Header />
        <div className="modern-content-wrapper">
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-page-container">
      <Header />

      <div className="modern-header-section">
        <div className="modern-header-content">
          <h1 className="modern-page-title">Volunteer Admin</h1>
          <p className="modern-page-subtitle">
            Pick a department to manage its shifts. Star the ones you're responsible for to keep them at the top.
          </p>
        </div>
      </div>

      <div className="modern-content-wrapper">
        {isAdmin && (
          <div className="admin-landing-actions">
            <Link to="/admin/all" className="admin-landing-all-link">
              📊 View All Departments Dashboard →
            </Link>
          </div>
        )}

        {loading ? (
          <div className="modern-loading-state">
            <div className="modern-loading-spinner" />
            <p>Loading departments…</p>
          </div>
        ) : error ? (
          <p className="modern-error">{error}</p>
        ) : (
          <>
            {hasPinned && <h2 className="admin-landing-section-title">Your Pinned Departments</h2>}
            <div className="admin-landing-grid">
              {sortedStats.map((dept, idx) => {
                const isPinned = pinnedRoles.includes(dept.roleName);
                const coveragePct = dept.totalCapacity > 0
                  ? Math.round((dept.totalFilled / dept.totalCapacity) * 100)
                  : 0;
                // Insert "Other Departments" heading between pinned and unpinned
                const prevIsPinned = idx > 0 && pinnedRoles.includes(sortedStats[idx - 1].roleName);
                const showDivider = hasPinned && prevIsPinned && !isPinned;

                return (
                  <React.Fragment key={dept.roleName}>
                    {showDivider && (
                      <h2 className="admin-landing-section-title admin-landing-divider">
                        Other Departments
                      </h2>
                    )}
                    <div className={`admin-landing-card ${isPinned ? "pinned" : ""}`}>
                      <button
                        className="admin-landing-pin"
                        onClick={() => togglePin(dept.roleName)}
                        title={isPinned ? "Unpin from top" : "Pin to top"}
                        aria-label={isPinned ? `Unpin ${dept.roleName}` : `Pin ${dept.roleName} to top`}
                      >
                        {isPinned ? "★" : "☆"}
                      </button>

                      <Link
                        to={`/admin/role/${encodeURIComponent(dept.roleName)}`}
                        className="admin-landing-card-content"
                      >
                        <h3 className="admin-landing-card-title">{dept.roleName}</h3>

                        {dept.totalShifts === 0 ? (
                          <p className="admin-landing-empty">No shifts yet</p>
                        ) : (
                          <>
                            <div className="admin-landing-stats-row">
                              <span className="admin-landing-stat">
                                <strong>{coveragePct}%</strong> covered
                              </span>
                              <span className="admin-landing-stat">
                                <strong>{dept.totalUnfilled}</strong> open
                              </span>
                              {dept.criticalShifts > 0 && (
                                <span className="admin-landing-stat critical">
                                  <strong>{dept.criticalShifts}</strong> critical
                                </span>
                              )}
                            </div>

                            <div className="admin-landing-progress">
                              <div
                                className="admin-landing-progress-fill"
                                style={{ width: `${coveragePct}%` }}
                              />
                            </div>

                            <p className="admin-landing-subtle">
                              {dept.totalFilled} of {dept.totalCapacity} spots filled · {dept.totalShifts} shift{dept.totalShifts !== 1 ? "s" : ""}
                            </p>
                          </>
                        )}
                      </Link>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}