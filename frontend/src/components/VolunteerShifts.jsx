import React, { useEffect, useState } from "react";
import "../styles/volunteer.css";
import Header from "./Header";
import { getUserId } from "../utils/authUtils";

export default function VolunteerShifts() {
  const [selectedDate, setSelectedDate] = useState("2025-11-07");
  const [shifts, setShifts] = useState([]);
  const [roleDetails, setRoleDetails] = useState({});
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRole, setExpandedRole] = useState(null);

  const dateOptions = [
    { label: "Wed 11/5", value: "2025-11-05", day: "Wednesday" },
    { label: "Thu 11/6", value: "2025-11-06", day: "Thursday" },
    { label: "Fri 11/7", value: "2025-11-07", day: "Friday" },
    { label: "Sat 11/8", value: "2025-11-08", day: "Saturday" },
    { label: "Sun 11/9", value: "2025-11-09", day: "Sunday" }
  ];

  const scheduleImages = {
    "2025-11-05": "https://i.ibb.co/spkQFTwf/Thursday.png",
    "2025-11-06": "https://burlycon.org/wp-content/uploads/2024/10/friday-2024.png",
    "2025-11-07": "https://burlycon.org/wp-content/uploads/2024/10/saturday-2024.png",
    "2025-11-08": "https://burlycon.org/wp-content/uploads/2024/10/sunday-2024.png",
    "2025-11-09": "https://burlycon.org/wp-content/uploads/2024/10/sunday-2024.png"
  };

  useEffect(() => {
    const id = getUserId();
    if (id) setUserId(id);
  }, []);

  // Fetch role details
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/shiftroles`)
      .then((res) => res.json())
      .then((data) => {
        const roleMap = {};
        data.forEach(role => {
          roleMap[role.name] = role;
        });
        setRoleDetails(roleMap);
      })
      .catch((err) => console.error("Error fetching role details:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((shift) => shift.date === selectedDate);
        setShifts(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching shifts:", err);
        setLoading(false);
      });
  }, [selectedDate]);

  const to12Hour = (timeStr) => {
    const [hour, min] = timeStr.split(":").map(Number);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = ((hour + 11) % 12) + 1;
    return `${displayHour}:${min.toString().padStart(2, "0")} ${suffix}`;
  };

  const handleSignup = async (shiftId) => {
    if (!userId) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/${shiftId}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        setShifts((prev) =>
          prev.map((shift) =>
            shift._id === shiftId
              ? { ...shift, volunteersRegistered: [...shift.volunteersRegistered, userId] }
              : shift
          )
        );
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  const handleCancel = async (shiftId) => {
    if (!userId) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/${shiftId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        setShifts((prev) =>
          prev.map((shift) =>
            shift._id === shiftId
              ? {
                  ...shift,
                  volunteersRegistered: shift.volunteersRegistered.filter((id) => id !== userId)
                }
              : shift
          )
        );
      }
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  const toggleRoleExpansion = (role) => {
    setExpandedRole(expandedRole === role ? null : role);
  };

  const grouped = shifts.reduce((acc, shift) => {
    if (!acc[shift.role]) acc[shift.role] = [];
    acc[shift.role].push(shift);
    return acc;
  }, {});

  const selectedDateOption = dateOptions.find(option => option.value === selectedDate);
  const totalSignedUp = shifts.filter(shift => shift.volunteersRegistered.includes(userId)).length;

  return (
    <div className="modern-page-container">
      <Header />
      
      {/* Hero Section */}
      <div className="modern-volunteer-hero">
        <div className="modern-volunteer-hero-content">
          <h1 className="modern-volunteer-title">✨ Choose Your Volunteer Shifts ✨</h1>
          <p className="modern-volunteer-subtitle">
            Help make BurlyCon magical! Select your preferred shifts and join the Sparkle Squad.
          </p>
          {totalSignedUp > 0 && (
            <div className="modern-signup-summary">
              🎭 You're signed up for {totalSignedUp} shift{totalSignedUp !== 1 ? 's' : ''} on {selectedDateOption?.day}
            </div>
          )}
        </div>
      </div>

      <div className="modern-content-wrapper">
        {/* Date Selection */}
        <div className="modern-date-section">
          <h2 className="modern-section-title">Select Event Day</h2>
          <div className="modern-date-switcher">
            {dateOptions.map(({ label, value, day }) => (
              <button
                type="button"
                key={value}
                className={`modern-date-button ${value === selectedDate ? 'active' : ''}`}
                onClick={() => setSelectedDate(value)}
              >
                <span className="modern-date-label">{label}</span>
                <span className="modern-date-day">{day}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Image */}
        <div className="modern-schedule-section">
          <h3 className="modern-schedule-title">📋 {selectedDateOption?.day} Schedule</h3>
          <div className="modern-schedule-image">
            <a 
              href={scheduleImages[selectedDate]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="modern-schedule-link"
            >
              <img 
                src={scheduleImages[selectedDate]} 
                alt={`Schedule for ${selectedDateOption?.day}`}
                className="modern-schedule-img"
              />
              <div className="modern-schedule-overlay">
                <span className="modern-schedule-text">🔍 Click to view full schedule</span>
              </div>
            </a>
          </div>
        </div>

        {/* Shifts Section */}
        <div className="modern-shifts-section">
          <div className="modern-section-header">
            <h2 className="modern-section-title">Available Volunteer Roles</h2>
            <p className="modern-section-description">
              {selectedDateOption?.day} • {Object.keys(grouped).length} roles available
            </p>
          </div>

          {loading ? (
            <div className="modern-loading-state">
              <div className="modern-loading-spinner"></div>
              <p>Loading volunteer opportunities...</p>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="modern-empty-state">
              <div className="modern-empty-icon">🎭</div>
              <h3 className="modern-empty-title">No shifts available</h3>
              <p className="modern-empty-description">
                All volunteer positions for {selectedDateOption?.day} are currently filled. 
                Check back later or try another day!
              </p>
            </div>
          ) : (
            <div className="modern-roles-grid">
              {Object.entries(grouped).map(([role, roleShifts]) => {
                const roleInfo = roleDetails[role] || {};
                const isExpanded = expandedRole === role;
                
                return (
                  <div key={role} className={`modern-role-card ${isExpanded ? 'expanded' : ''}`}>
                    <div 
                      className="modern-role-header clickable" 
                      onClick={() => toggleRoleExpansion(role)}
                    >
                      <div className="modern-role-info">
                        <h3 className="modern-role-title">{role}</h3>
                        <p className="modern-role-count">
                          {roleShifts.length} time slot{roleShifts.length !== 1 ? 's' : ''} available
                        </p>
                      </div>
                      <div className="modern-role-actions">
                        <div className="modern-role-icon">🌟</div>
                        <div className={`modern-expand-icon ${isExpanded ? 'expanded' : ''}`}>
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* Role Details - Expandable */}
                    {isExpanded && (
                      <div className="modern-role-details">
                        <div className="modern-role-details-content">
                          {/* Task Description from shifts */}
                          {roleShifts[0]?.taskDescription && (
                            <div className="modern-detail-section">
                              <h4 className="modern-detail-title">
                                <span className="modern-detail-icon">📝</span>
                                What You'll Do
                              </h4>
                              <p className="modern-detail-text">{roleShifts[0].taskDescription}</p>
                            </div>
                          )}

                          {/* Role Responsibilities */}
                          {roleInfo.responsibilities && (
                            <div className="modern-detail-section">
                              <h4 className="modern-detail-title">
                                <span className="modern-detail-icon">🎯</span>
                                Responsibilities
                              </h4>
                              <p className="modern-detail-text">{roleInfo.responsibilities}</p>
                            </div>
                          )}

                          {/* Location */}
                          {roleInfo.location && (
                            <div className="modern-detail-section">
                              <h4 className="modern-detail-title">
                                <span className="modern-detail-icon">📍</span>
                                Location
                              </h4>
                              <p className="modern-detail-text">{roleInfo.location}</p>
                            </div>
                          )}

                          {/* Physical Requirements */}
                          {roleInfo.physicalRequirements && (
                            <div className="modern-detail-section">
                              <h4 className="modern-detail-title">
                                <span className="modern-detail-icon">💪</span>
                                Physical Requirements
                              </h4>
                              <p className="modern-detail-text">{roleInfo.physicalRequirements}</p>
                            </div>
                          )}

                          {/* Contact Information
                          {(roleInfo.pointOfContact || roleInfo.contactPhone) && (
                            <div className="modern-detail-section">
                              <h4 className="modern-detail-title">
                                <span className="modern-detail-icon">👤</span>
                                Point of Contact
                              </h4>
                              <div className="modern-contact-info">
                                {roleInfo.pointOfContact && (
                                  <p className="modern-contact-name">{roleInfo.pointOfContact}</p>
                                )}
                                {roleInfo.contactPhone && (
                                  <a 
                                    href={`tel:${roleInfo.contactPhone}`} 
                                    className="modern-contact-phone"
                                  >
                                    📞 {roleInfo.contactPhone}
                                  </a>
                                )}
                              </div>
                            </div>
                          )} */}

                          {/* Admin Notes if available */}
                          {roleShifts.some(shift => shift.notes) && (
                            <div className="modern-detail-section">
                              <h4 className="modern-detail-title">
                                <span className="modern-detail-icon">📌</span>
                                Additional Notes
                              </h4>
                              {roleShifts
                                .filter(shift => shift.notes)
                                .map(shift => (
                                  <p key={shift._id} className="modern-detail-text modern-note">
                                    {shift.notes}
                                  </p>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="modern-shifts-list">
                      {roleShifts
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((shift) => {
                          const isSignedUp = shift.volunteersRegistered.includes(userId);
                          const available = shift.volunteersNeeded - shift.volunteersRegistered.length;
                          
                          return (
                            <div key={shift._id} className="modern-shift-item">
                              <div className="modern-shift-time">
                                <span className="modern-time-icon">🕒</span>
                                <span className="modern-time-range">
                                  {to12Hour(shift.startTime)}–{to12Hour(shift.endTime)}
                                </span>
                              </div>
                              
                              <div className="modern-shift-availability">
                                <span className={`modern-availability-badge ${available <= 0 ? 'full' : available <= 2 ? 'low' : 'available'}`}>
                                  {available} spot{available !== 1 ? 's' : ''} left
                                </span>
                              </div>

                              <div className="modern-shift-action">
                                {!userId ? (
                                  <div className="modern-login-prompt">
                                    <span className="modern-lock-icon">🔒</span>
                                    <span className="modern-login-text">Log in to sign up</span>
                                  </div>
                                ) : isSignedUp ? (
                                  <button
                                    type="button"
                                    onClick={() => handleCancel(shift._id)}
                                    className="modern-cancel-button"
                                  >
                                    <span className="modern-button-icon">❌</span>
                                    <span className="modern-button-text">Cancel</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSignup(shift._id)}
                                    disabled={available <= 0}
                                    className={`modern-signup-button ${available <= 0 ? 'disabled' : ''}`}
                                  >
                                    <span className="modern-button-icon">✨</span>
                                    <span className="modern-button-text">
                                      {available <= 0 ? 'Full' : 'Sign Up'}
                                    </span>
                                  </button>
                                )}
                              </div>
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