import React, { useState } from "react";
import "../styles/shiftForm.css";

export default function ShiftSchedule({ shifts, viewMode = "volunteer", onShiftUpdated, onShiftDeleted }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    startTime: "",
    endTime: "",
    volunteersNeeded: 1,
    taskDescription: "",
    notes: ""
  });

  const handleEditClick = (shift) => {
    setEditingId(shift._id);
    setEditData({
      startTime: shift.startTime,
      endTime: shift.endTime,
      volunteersNeeded: shift.volunteersNeeded,
      taskDescription: shift.taskDescription,
      notes: shift.notes || ""
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/shifts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      });

      if (res.ok) {
        const updated = await res.json();
        onShiftUpdated?.(updated);
        setEditingId(null);
      } else {
        console.error("Failed to update shift");
      }
    } catch (err) {
      console.error("Error updating shift:", err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this shift?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/shifts/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        onShiftDeleted?.(id);
      } else {
        console.error("Failed to delete shift");
      }
    } catch (err) {
      console.error("Error deleting shift:", err);
    }
  };

  const sortedShifts = [...shifts].sort((a, b) => a.startTime.localeCompare(b.startTime));

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

            {isEditing ? (
              <>
                <label>Start Time:</label>
                <input name="startTime" value={editData.startTime} onChange={handleEditChange} />

                <label>End Time:</label>
                <input name="endTime" value={editData.endTime} onChange={handleEditChange} />

                <label>Volunteers Needed:</label>
                <input type="number" name="volunteersNeeded" value={editData.volunteersNeeded} onChange={handleEditChange} />

                <label>Task Description:</label>
                <textarea name="taskDescription" value={editData.taskDescription} onChange={handleEditChange} />

                <label>Notes (Admin only):</label>
                <textarea name="notes" value={editData.notes} onChange={handleEditChange} />

                <div className="shift-card-buttons">
                  <button type="button" onClick={() => handleEditSubmit(shift._id)}>💾 Save</button>
                  <button type="button" onClick={() => setEditingId(null)}>❌ Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p><strong>Time:</strong> {shift.startTime}–{shift.endTime}</p>
                <p><strong>Needed:</strong> {shift.volunteersNeeded}</p>
                <p><strong>Signed Up:</strong> {filled}</p>
                <p><strong>Status:</strong> {isFull ? "✅ Full" : `🟠 ${available} spots left`}</p>

                {viewMode === "admin" && (
                  <>
                    <p><strong>Description:</strong> {shift.taskDescription}</p>
                    {shift.notes && <p><strong>Notes:</strong> {shift.notes}</p>}

                    <div className="shift-card-buttons">
                      <button type="button" onClick={() => handleEditClick(shift)}>✏️ Edit</button>
                      <button type="button" onClick={() => handleDelete(shift._id)}>❌ Delete</button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
