import React from "react";

export default function ShiftCard({ shift }) {
  return (
    <div className="shift-card">
      <p><strong>Time:</strong> {shift.startTime} – {shift.endTime}</p>
      <p><strong>Role:</strong> {shift.role}</p>
      <p><strong>Spots Left:</strong> {shift.volunteersNeeded - (shift.volunteersRegistered?.length || 0)}</p>
      <button type="button">See Details</button>
        <button type="button">Sign Up</button>
    </div>
  );
}
