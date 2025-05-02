import React from "react";

export default function ShiftCard({ shift }) {
  const handleSignUp = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/volunteer/${shift._id}/signup`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "6811617f46ed53b3155162c3" // TEMP: replace with real userId when auth is in place
        }),
      });

      if (response.ok) {
        alert("Successfully signed up!");
        // optionally trigger a UI update or callback here
      } else {
        const errorData = await response.json();
        alert(`Signup failed: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Error signing up:", err);
    }
  };

  return (
    <div className="shift-card">
      <h3>{shift.role}</h3>
      <p><strong>Time:</strong> {shift.startTime} – {shift.endTime}</p>
      <p><strong>Available Spots:</strong> {shift.volunteersNeeded - (shift.volunteersRegistered?.length || 0)}</p>
      <button type="button" onClick={handleSignUp}>Sign Up</button>
    </div>
  );
}
