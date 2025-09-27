import React, { useEffect, useState } from "react";
import Header from "./Header";
import ShiftForm from "./ShiftForm";
import "../styles/admin.css";
import { hasRole } from "../utils/authUtils";
import { getDatePortion, formatDateDisplay } from "../utils/dateUtils";  

export default function AdminShiftOverview() {
  const [allShifts, setAllShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState(new Set());
  const [editingShift, setEditingShift] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Check if user is admin or lead
  const isAdmin = hasRole("Admin") || hasRole("Lead");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer`)
      .then((res) => res.json())
      .then((data) => {
        setAllShifts(data);
        setLoading(false);
        // Auto-expand all roles initially
        const roles = Array.from(new Set(data.map((s) => s.role)));
        setExpandedRoles(new Set(roles));
      })
      .catch((err) => {
        console.error("Error loading shifts:", err);
        setLoading(false);
      });
  }, []);

  const roles = Array.from(new Set(allShifts.map((s) => s.role))).sort();

  // FIX: Use getDatePortion for consistent date extraction
  const availableDates = Array.from(
    new Set(
      allShifts
        .filter((s) => !!s.date)
        .map((s) => getDatePortion(s.date))  // <-- CHANGED: Use getDatePortion
    )
  ).sort();

  // getDatePortion for date comparison
  const filteredShifts = allShifts.filter((shift) => {
    const normalizedShiftDate = getDatePortion(shift.date);  
    const matchesDate = !selectedDate || normalizedShiftDate === selectedDate;
    return matchesDate;
  });

  const shiftsByRole = {};
  filteredShifts.forEach((shift) => {
    if (!shiftsByRole[shift.role]) shiftsByRole[shift.role] = [];
    shiftsByRole[shift.role].push(shift);
  });

  const toggleRole = (role) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(role)) {
      newExpanded.delete(role);
    } else {
      newExpanded.add(role);
    }
    setExpandedRoles(newExpanded);
  };

  const toggleAllRoles = () => {
    if (expandedRoles.size === Object.keys(shiftsByRole).length) {
      setExpandedRoles(new Set());
    } else {
      setExpandedRoles(new Set(Object.keys(shiftsByRole)));
    }
  };

  const handleEditShift = (shift) => {
    setEditingShift(shift._id);
    setEditFormData({
      date: getDatePortion(shift.date),
      startTime: shift.startTime,
      endTime: shift.endTime,
      volunteersNeeded: shift.volunteersNeeded,
      notes: shift.notes || ''
    });
  };

  const handleSaveShift = async () => {
    if (!editingShift) return;

    try {
      // Prepare data with proper date conversion
      const updateData = {
        ...editFormData,
        date: editFormData.date
      };

      // Use the correct endpoint - just /api/volunteer/{id}
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/${editingShift}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedShift = await response.json();
        setAllShifts(prev => prev.map(shift => 
          shift._id === editingShift ? updatedShift : shift
        ));
        setEditingShift(null);
        setEditFormData({});
      } else {
        const errorText = await response.text();
        console.error('Failed to update shift:', errorText);
        alert('Failed to update shift. Please try again.');
      }
    } catch (error) {
      console.error('Error updating shift:', error);
      alert('Error updating shift. Please check your connection.');
    }
  };

  const handleCancelEdit = () => {
    setEditingShift(null);
    setEditFormData({});
  };

  const handleDeleteShift = async (shiftId) => {
    if (!window.confirm('Are you sure you want to delete this shift? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Attempting to delete shift:', shiftId);
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/${shiftId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        console.log('Shift deleted successfully');
        setAllShifts(prev => prev.filter(shift => shift._id !== shiftId));
      } else {
        const errorData = await response.text();
        console.error('Failed to delete shift:', response.status, errorData);
        alert(`Failed to delete shift: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
      alert(`Error deleting shift: ${error.message}`);
    }
  };

  const formatTime = (timeStr) => {
    const [hour, min] = timeStr.split(":").map(Number);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = ((hour + 11) % 12) + 1;
    return `${displayHour}:${min.toString().padStart(2, "0")} ${suffix}`;
  };

  // Calculate summary stats
  const totalShifts = filteredShifts.length;
  const filledShifts = filteredShifts.filter(shift => {
    const filled = shift.volunteersRegistered?.length || 0;
    const needed = shift.volunteersNeeded || 0;
    return filled >= needed;
  }).length;
  const criticalShifts = filteredShifts.filter(shift => {
    const filled = shift.volunteersRegistered?.length || 0;
    return filled === 0;
  }).length;

  // FIX: Create date object more carefully for display
  const selectedDateLabel = selectedDate 
    ? (() => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        });
      })()
    : "All Dates";

  return (
    <div className="modern-page-container">
      <Header />
      
      {/* Header Section */}
      <div className="modern-header-section">
        <div className="modern-header-content">
          <h1 className="modern-page-title">🎭 Shift Coverage Overview</h1>
          <p className="modern-page-subtitle">
            Monitor volunteer coverage and manage shift assignments across all roles
          </p>
        </div>
      </div>

      <div className="modern-content-wrapper">
        {/* Summary Stats - Admin Only */}
        {isAdmin && (
          <div className="modern-summary-dashboard">
            <div className="modern-summary-card gradient-blue">
              <div className="modern-summary-icon">📊</div>
              <div className="modern-summary-content">
                <div className="modern-summary-number">{totalShifts}</div>
                <div className="modern-summary-title">Total Shifts</div>
              </div>
            </div>
            
            <div className="modern-summary-card gradient-green">
              <div className="modern-summary-icon">✅</div>
              <div className="modern-summary-content">
                <div className="modern-summary-number">{filledShifts}</div>
                <div className="modern-summary-title">Fully Covered</div>
              </div>
            </div>
            
            <div className="modern-summary-card gradient-purple">
              <div className="modern-summary-icon">🚨</div>
              <div className="modern-summary-content">
                <div className="modern-summary-number">{criticalShifts}</div>
                <div className="modern-summary-title">Need Volunteers</div>
              </div>
            </div>
          </div>
        )}

        {/* Add Shift Form - Admin Only */}
        {isAdmin && (
          <div className="modern-add-shift-section">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="modern-primary-button"
            >
              <span className="button-icon">➕</span>
              {showAddForm ? "Cancel" : "Add New Shift"}
            </button>

            {showAddForm && (
              <div className="modern-add-form-container">
                <div className="modern-form-card">
                  <div className="modern-form-header">
                    <h3 className="modern-form-title">Create New Shift</h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="modern-close-button"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modern-form-content">
                    <ShiftForm
                      existingShifts={allShifts}
                      onShiftCreated={(newShift) => {
                        setAllShifts((prev) => [...prev, newShift]);
                        setShowAddForm(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filter Section */}
        <div className="modern-filter-section">
          <div className="modern-filter-header">
            <h3 className="modern-filter-title">📅 Viewing: {selectedDateLabel}</h3>
            <div className="modern-filter-controls">
              <select
                value={selectedDate || ""}
                onChange={(e) => setSelectedDate(e.target.value || null)}
                className="modern-date-select"
              >
                <option value="">All Dates</option>
                {availableDates.map((date) => {
                  // FIX: Create date object more carefully
                  const [year, month, day] = date.split('-').map(Number);
                  return (
                    <option key={date} value={date}>
                      {new Date(year, month - 1, day).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </option>
                  );
                })}
              </select>
              
              <button
                onClick={toggleAllRoles}
                className="modern-expand-all-button"
              >
                {expandedRoles.size === Object.keys(shiftsByRole).length ? "🔽 Collapse All" : "🔼 Expand All"}
              </button>
            </div>
          </div>
        </div>

        {/* Shifts Section */}
        <div className="modern-shifts-overview">
          {loading ? (
            <div className="modern-loading-state">
              <div className="modern-loading-spinner"></div>
              <p>Loading shift coverage data...</p>
            </div>
          ) : Object.keys(shiftsByRole).length === 0 ? (
            <div className="modern-empty-state">
              <div className="modern-empty-icon">📅</div>
              <h3 className="modern-empty-title">No shifts found</h3>
              <p className="modern-empty-description">
                {selectedDate 
                  ? `No shifts scheduled for ${selectedDateLabel}. Try selecting a different date.`
                  : "No shifts have been created yet. Add your first shift to get started!"
                }
              </p>
            </div>
          ) : (
            <div className="modern-role-accordion-container">
              {Object.entries(shiftsByRole)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([role, shifts]) => {
                  const isExpanded = expandedRoles.has(role);
                  const filledCount = shifts.filter(shift => {
                    const filled = shift.volunteersRegistered?.length || 0;
                    const needed = shift.volunteersNeeded || 0;
                    return filled >= needed;
                  }).length;
                  const criticalCount = shifts.filter(shift => {
                    const filled = shift.volunteersRegistered?.length || 0;
                    return filled === 0;
                  }).length;

                  return (
                    <div key={role} className={`modern-role-accordion ${isExpanded ? 'expanded' : ''}`}>
                      <div 
                        className="modern-accordion-header"
                        onClick={() => toggleRole(role)}
                      >
                        <div className="modern-accordion-title-section">
                          <h3 className="modern-accordion-title">{role}</h3>
                          <div className="modern-accordion-stats">
                            <span className="modern-stat-badge total">
                              {shifts.length} shift{shifts.length !== 1 ? 's' : ''}
                            </span>
                            {filledCount > 0 && (
                              <span className="modern-stat-badge filled">
                                {filledCount} covered
                              </span>
                            )}
                            {criticalCount > 0 && (
                              <span className="modern-stat-badge critical">
                                {criticalCount} urgent
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`modern-accordion-arrow ${isExpanded ? 'expanded' : ''}`}>
                          ▼
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="modern-accordion-content">
                          <div className="modern-shifts-grid">
                            {shifts
                              .sort((a, b) => {
                                // Sort by date first, then by start time
                                const dateCompare = a.date.localeCompare(b.date);
                                if (dateCompare !== 0) return dateCompare;
                                return a.startTime.localeCompare(b.startTime);
                              })
                              .map((shift) => {
                                const filled = shift.volunteersRegistered?.length || 0;
                                const needed = shift.volunteersNeeded || 0;
                                const statusClass = filled >= needed ? "filled" : filled === 0 ? "empty" : "partial";

                                return (
                                  <div key={shift._id} className={`modern-shift-coverage-card ${statusClass}`}>
                                    {editingShift === shift._id ? (
                                      /* Edit Mode */
                                      <div className="modern-shift-edit-form">
                                        <div className="modern-edit-header">
                                          <div className="modern-shift-time-info">
                                            <div className="modern-shift-date">
                                              {formatDateDisplay(shift.date)}  {/* <-- CHANGED: Use formatDateDisplay */}
                                            </div>
                                            <div className="modern-shift-time">
                                              🕒 {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                            </div>
                                          </div>
                                          <div className="modern-edit-actions">
                                            <button
                                              onClick={handleSaveShift}
                                              className="modern-save-button"
                                              title="Save changes"
                                            >
                                              💾
                                            </button>
                                            <button
                                              onClick={handleCancelEdit}
                                              className="modern-cancel-edit-button"
                                              title="Cancel editing"
                                            >
                                              ❌
                                            </button>
                                          </div>
                                        </div>

                                        <div className="modern-edit-fields">
                                          <div className="modern-edit-grid">
                                            <div className="modern-edit-field">
                                              <label className="modern-edit-label">
                                                📅 Date:
                                              </label>
                                              <input
                                                type="date"
                                                value={editFormData.date || ''}
                                                onChange={(e) => setEditFormData(prev => ({
                                                  ...prev,
                                                  date: e.target.value
                                                }))}
                                                className="modern-edit-input"
                                                required
                                              />
                                            </div>

                                            <div className="modern-edit-field">
                                              <label className="modern-edit-label">
                                                🕐 Start Time:
                                              </label>
                                              <input
                                                type="time"
                                                value={editFormData.startTime || ''}
                                                onChange={(e) => setEditFormData(prev => ({
                                                  ...prev,
                                                  startTime: e.target.value
                                                }))}
                                                className="modern-edit-input"
                                                required
                                              />
                                            </div>

                                            <div className="modern-edit-field">
                                              <label className="modern-edit-label">
                                                🕑 End Time:
                                              </label>
                                              <input
                                                type="time"
                                                value={editFormData.endTime || ''}
                                                onChange={(e) => setEditFormData(prev => ({
                                                  ...prev,
                                                  endTime: e.target.value
                                                }))}
                                                className="modern-edit-input"
                                                required
                                              />
                                            </div>

                                            <div className="modern-edit-field">
                                              <label className="modern-edit-label">
                                                👥 Volunteers:
                                              </label>
                                              <input
                                                type="number"
                                                min="1"
                                                value={editFormData.volunteersNeeded || ''}
                                                onChange={(e) => setEditFormData(prev => ({
                                                  ...prev,
                                                  volunteersNeeded: parseInt(e.target.value) || 1
                                                }))}
                                                className="modern-edit-input"
                                                required
                                              />
                                            </div>
                                          </div>

                                          <div className="modern-edit-field">
                                            <label className="modern-edit-label">
                                              📌 Admin Notes:
                                            </label>
                                            <textarea
                                              value={editFormData.notes || ''}
                                              onChange={(e) => setEditFormData(prev => ({
                                                ...prev,
                                                notes: e.target.value
                                              }))}
                                              className="modern-edit-textarea"
                                              rows={2}
                                              placeholder="Internal notes for admins..."
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      /* View Mode */
                                      <>
                                        <div className="modern-shift-header">
                                          <div className="modern-shift-time-info">
                                            <div className="modern-shift-date">
                                              {formatDateDisplay(shift.date)}  {/* <-- CHANGED: Use formatDateDisplay */}
                                            </div>
                                            <div className="modern-shift-time">
                                              🕒 {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                            </div>
                                          </div>
                                          <div className="modern-shift-header-actions">
                                            <div className={`modern-coverage-indicator ${statusClass}`}>
                                              <span className="modern-coverage-text">
                                                {filled}/{needed}
                                              </span>
                                            </div>
                                            {isAdmin && (
                                              <div className="modern-shift-admin-actions">
                                                <button
                                                  onClick={() => handleEditShift(shift)}
                                                  className="modern-edit-shift-button"
                                                  title="Edit shift"
                                                >
                                                  ✏️
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteShift(shift._id)}
                                                  className="modern-delete-shift-button"
                                                  title="Delete shift"
                                                >
                                                  🗑️
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {shift.taskDescription && (
                                          <div className="modern-shift-description">
                                            <span className="modern-description-icon">📝</span>
                                            <span className="modern-description-text">{shift.taskDescription}</span>
                                          </div>
                                        )}

                                        {filled < needed && (
                                          <div className="modern-shift-alert">
                                            <span className="modern-alert-icon">⚠️</span>
                                            <span className="modern-alert-text">
                                              Needs {needed - filled} more volunteer{needed - filled !== 1 ? 's' : ''}
                                            </span>
                                          </div>
                                        )}

                                        {filled >= needed && (
                                          <div className="modern-shift-success">
                                            <span className="modern-success-icon">✅</span>
                                            <span className="modern-success-text">Fully covered</span>
                                          </div>
                                        )}

                                        {shift.notes && (
                                          <div className="modern-shift-notes">
                                            <span className="modern-notes-icon">📌</span>
                                            <span className="modern-notes-text">{shift.notes}</span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
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
  );
}