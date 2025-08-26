import React, { useState } from "react";
import { getDatePortion } from "../utils/dateUtils";
import "../styles/shiftForm.css";

export default function ShiftSchedule({ shifts, viewMode = "volunteer", onShiftUpdated, onShiftDeleted }) {
  const [editingId, setEditingId] = useState(null);
  const [viewingVolunteers, setViewingVolunteers] = useState(null);
  const [editData, setEditData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    volunteersNeeded: 1,
    taskDescription: "",
    notes: ""
  });

  const handleEditClick = (shift) => {
    setEditingId(shift._id);
    setEditData({
      date: getDatePortion(shift.date), // Extract date in YYYY-MM-DD format
      startTime: shift.startTime,
      endTime: shift.endTime,
      volunteersNeeded: shift.volunteersNeeded,
      taskDescription: shift.taskDescription || "",
      notes: shift.notes || ""
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (id) => {
    try {
      const updateData = {
        ...editData,
        date: editData.date
      };

      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/shifts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        const updated = await res.json();
        onShiftUpdated?.(updated);
        setEditingId(null);
      } else {
        console.error("Failed to update shift");
        alert("Failed to update shift. Please try again.");
      }
    } catch (err) {
      console.error("Error updating shift:", err);
      alert("Error updating shift. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this shift?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        onShiftDeleted?.(id);
      } else {
        console.error("Failed to delete shift");
        alert("Failed to delete shift. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting shift:", err);
      alert("Error deleting shift. Please try again.");
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hour, min] = timeStr.split(":").map(Number);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = ((hour + 11) % 12) + 1;
    return `${displayHour}:${min.toString().padStart(2, "0")} ${suffix}`;
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const datePart = getDatePortion(dateStr);
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  };

  const sortedShifts = [...shifts].sort((a, b) => {
    // Sort by date first, then by start time
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="shift-schedule">
      {sortedShifts.map((shift) => {
        const filled = shift.volunteersRegistered?.length || 0;
        const available = shift.volunteersNeeded - filled;
        const isFull = available <= 0;
        const isEditing = editingId === shift._id;

        return (
          <div key={shift._id} className="shift-card">
            <h3>{shift.role}</h3>
            <p className="shift-date">{formatDateForDisplay(shift.date)}</p>

            {isEditing ? (
              <div className="shift-edit-form">
                <div className="form-group">
                  <label>Date:</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={editData.date} 
                    onChange={handleEditChange}
                    min={today}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time:</label>
                    <input 
                      type="time" 
                      name="startTime" 
                      value={editData.startTime} 
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Time:</label>
                    <input 
                      type="time" 
                      name="endTime" 
                      value={editData.endTime} 
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Volunteers Needed:</label>
                  <input 
                    type="number" 
                    name="volunteersNeeded" 
                    value={editData.volunteersNeeded} 
                    onChange={handleEditChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Task Description:</label>
                  <textarea 
                    name="taskDescription" 
                    value={editData.taskDescription} 
                    onChange={handleEditChange}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Admin Notes:</label>
                  <textarea 
                    name="notes" 
                    value={editData.notes} 
                    onChange={handleEditChange}
                    rows="2"
                    placeholder="Internal notes (not visible to volunteers)"
                  />
                </div>

                <div className="shift-card-buttons">
                  <button type="button" className="save-button" onClick={() => handleEditSubmit(shift._id)}>
                    💾 Save Changes
                  </button>
                  <button type="button" className="cancel-button" onClick={() => setEditingId(null)}>
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p><strong>Time:</strong> {formatTime(shift.startTime)} – {formatTime(shift.endTime)}</p>
                <p><strong>Needed:</strong> {shift.volunteersNeeded}</p>
                <p><strong>Signed Up:</strong> {filled}</p>
                <p><strong>Status:</strong> 
                  {isFull ? (
                    <span className="shift-status-full">✅ Full</span>
                  ) : (
                    <span className="shift-status-available">🟠 {available} spots left</span>
                  )}
                </p>

                {shift.taskDescription && (
                  <p><strong>Description:</strong> {shift.taskDescription}</p>
                )}

                {viewMode === "admin" && (
                  <>
                    {shift.notes && (
                      <p className="admin-notes"><strong>Notes:</strong> {shift.notes}</p>
                    )}

                    <div className="shift-card-buttons">
                      <button type="button" onClick={() => handleEditClick(shift)}>✏️ Edit</button>
                      <button type="button" onClick={() => setViewingVolunteers(shift)}>👥 View Volunteers</button>
                      <button type="button" className="delete-button" onClick={() => handleDelete(shift._id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        );
      })}

      {/* Volunteer Viewer Modal */}
      {viewingVolunteers && (
        <div className="modal-backdrop" onClick={() => setViewingVolunteers(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Volunteers for {viewingVolunteers.role}</h2>
            <p className="modal-shift-info">
              {formatDateForDisplay(viewingVolunteers.date)} • {formatTime(viewingVolunteers.startTime)} – {formatTime(viewingVolunteers.endTime)}
            </p>
            {viewingVolunteers.volunteersRegistered?.length > 0 ? (
              <ul className="volunteer-list">
                {viewingVolunteers.volunteersRegistered.map((v, index) => (
                  <li key={index}>{v}</li>
                ))}
              </ul>
            ) : (
              <p className="no-volunteers">No volunteers signed up yet.</p>
            )}
            <button type="button" className="modal-close-button" onClick={() => setViewingVolunteers(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}