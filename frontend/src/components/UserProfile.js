import React, { useState, useEffect } from "react";
import "../styles/profile.css";
import Header from "./Header";
import { useLocation } from "react-router-dom";

export default function UserProfile() {
  const location = useLocation();
  const [volunteerShifts, setVolunteerShifts] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check if we navigated from login
  useEffect(() => {
    const justLoggedIn = location.state?.justLoggedIn;
    console.log("🔁 Navigated from login?", justLoggedIn);
  }, [location]);

  // Get userId safely from JWT
  let userId = null;
  try {
    const token = localStorage.getItem("access_token");
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
    }
  } catch (error) {
    console.error("Error parsing JWT:", error);
  }

  // Get user info
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.given_name || user?.email?.split("@")[0] || "Volunteer";

  // Fetch user shifts
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched volunteer data:", data);
        setVolunteerShifts(data.shifts || []);
        setTotalHours(data.totalHours || 0);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching volunteer info:", error);
        setLoading(false);
      });
  }, [userId]);

  const handleCancelShift = async (shiftId) => {
    const confirmed = window.confirm("Are you sure you want to cancel this shift?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/${shiftId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        setVolunteerShifts((prev) => prev.filter((shift) => shift._id !== shiftId));

      } else {
        const error = await response.json();
        console.error("Cancel failed:", error.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  function formatTime(timeStr) {
    if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":")) return "Invalid time";
    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const adjustedHour = h % 12 || 12;
    return `${adjustedHour}:${minute} ${ampm}`;
  }

  const getDiscountCode = () => {
    if (totalHours >= 8) return "FULLPASS2024";
    if (totalHours >= 4) return "HALFPASS2024";
    return null;
  };

  const getDiscountType = () => {
    if (totalHours >= 8) return "full";
    if (totalHours >= 4) return "half";
    return null;
  };

  // Group shifts by role and date
  const grouped = volunteerShifts.reduce((acc, shift) => {
    const key = `${shift.role}|${shift.date}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(shift);
    return acc;
  }, {});

  return (
    <div className="modern-page-container">
      <Header />
      
      {/* Hero Section */}
      <div className="modern-profile-hero">
        <div className="modern-profile-hero-content">
          <div className="modern-profile-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="modern-profile-info">
            <h1 className="modern-profile-title">Welcome back, {userName}!</h1>
            <p className="modern-profile-subtitle">Your volunteer dashboard</p>
          </div>
        </div>
      </div>

      <div className="modern-content-wrapper">
        {/* Stats Section */}
        <div className="modern-stats-section">
          <div className="modern-stats-grid">
            <div className="modern-stat-card hours">
              <div className="modern-stat-icon">⏰</div>
              <div className="modern-stat-content">
                <div className="modern-stat-number">{totalHours}</div>
                <div className="modern-stat-label">Hours Volunteered</div>
              </div>
            </div>
            
            <div className="modern-stat-card shifts">
              <div className="modern-stat-icon">📅</div>
              <div className="modern-stat-content">
                <div className="modern-stat-number">{volunteerShifts.length}</div>
                <div className="modern-stat-label">Active Shifts</div>
              </div>
            </div>
            
            <div className="modern-stat-card status">
              <div className="modern-stat-icon">⭐</div>
              <div className="modern-stat-content">
                <div className="modern-stat-number">
                  {totalHours >= 8 ? "Superstar" : totalHours >= 4 ? "All-Star" : "Rising Star"}
                </div>
                <div className="modern-stat-label">Volunteer Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Discount Alert */}
        {totalHours >= 4 && (
          <div className={`modern-discount-alert ${getDiscountType()}`}>
            <div className="modern-discount-icon">
              {totalHours >= 8 ? "🎉" : "✨"}
            </div>
            <div className="modern-discount-content">
              <h3 className="modern-discount-title">
                {totalHours >= 8 ? "FREE FULL PASS EARNED!" : "HALF PRICE PASS EARNED!"}
              </h3>
              <p className="modern-discount-description">
                Amazing work! You've earned a {totalHours >= 8 ? "free full pass" : "half price pass"} to BurlyCon.
              </p>
              <div className="modern-discount-code">
                <span className="modern-code-label">Your discount code:</span>
                <span className="modern-code-value">{getDiscountCode()}</span>
                <button 
                  className="modern-copy-button"
                  onClick={() => navigator.clipboard.writeText(getDiscountCode())}
                  title="Copy code"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shifts Section */}
        <div className="modern-shifts-section">
          <div className="modern-section-header">
            <h2 className="modern-section-title">My Volunteer Shifts</h2>
            {volunteerShifts.length > 0 && (
              <p className="modern-section-description">
                Manage your upcoming volunteer commitments
              </p>
            )}
          </div>

          {loading ? (
            <div className="modern-loading-state">
              <div className="modern-loading-spinner"></div>
              <p>Loading your shifts...</p>
            </div>
          ) : volunteerShifts.length === 0 ? (
            <div className="modern-empty-state">
              <div className="modern-empty-icon">📅</div>
              <h3 className="modern-empty-title">No shifts scheduled</h3>
              <p className="modern-empty-description">
                Ready to help make BurlyCon amazing? Browse available volunteer opportunities!
              </p>
              <a href="/volunteer" className="modern-empty-action">
                <span className="modern-button-icon">🔍</span>
                Browse Volunteer Shifts
              </a>
            </div>
          ) : (
            <div className="modern-shifts-grid">
              {Object.entries(grouped).map(([key, shifts]) => {
                const [role, date] = key.split("|");
                const sorted = shifts.slice().sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                  <div key={key} className="modern-shift-card">
                    <div className="modern-shift-header">
                      <div className="modern-shift-role">
                        <h3 className="modern-shift-title">{role}</h3>
                        <p className="modern-shift-date">
                          {new Date(date).toLocaleDateString(undefined, {
                            weekday: "long",
                            month: "short",
                            day: "numeric"
                          })}
                        </p>
                      </div>
                      <div className="modern-shift-badge">
                        {sorted.length} {sorted.length === 1 ? 'shift' : 'shifts'}
                      </div>
                    </div>

                    <div className="modern-shift-times">
                      {sorted.map((shift) => {
                        const start = formatTime(shift.startTime);
                        const end = formatTime(shift.endTime);
                        return (
                          <div key={shift._id} className="modern-shift-time-slot">
                            <div className="modern-time-info">
                              <span className="modern-time-icon">🕒</span>
                              <span className="modern-time-range">{start} – {end}</span>
                            </div>
                            <button
                              type="button"
                              className="modern-cancel-button"
                              onClick={() => handleCancelShift(shift._id)}
                              title="Cancel this shift"
                            >
                              <span className="modern-cancel-icon">❌</span>
                              <span className="modern-cancel-text">Cancel</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}