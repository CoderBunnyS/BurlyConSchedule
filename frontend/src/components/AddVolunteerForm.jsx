import React, { useState } from "react";

export default function AddVolunteerForm({ onVolunteerCreated }) {
  const [formData, setFormData] = useState({
    stageName: "",
    email: "",
    phone: "",
    committedHours: 0
  });

  const [created, setCreated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const getPassCode = (hours) => {
    if (hours >= 8) return "FULL-PASS-EXAMPLE";
    if (hours >= 4) return "HALF-PASS-EXAMPLE";
    return "NO-PASS";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const passCode = getPassCode(Number(formData.committedHours));

    const newVolunteer = {
      ...formData,
      committedHours: Number(formData.committedHours),
      passCode
    };

    onVolunteerCreated?.(newVolunteer);
    setCreated(true);
    setFormData({ stageName: "", email: "", phone: "", committedHours: 0 });
  };

  return (
    <form className="shift-form" onSubmit={handleSubmit}>
      <h2>Add Volunteer Manually</h2>

      <label htmlFor="stageName">Stage Name:</label>
      <input
        type="text"
        name="stageName"
        value={formData.stageName}
        onChange={handleChange}
        required
      />

      <label htmlFor="email">Email Address:</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <label htmlFor="phone">Phone Number:</label>
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />

      <label htmlFor="committedHours">Hours Committed:</label>
      <input
        type="number"
        name="committedHours"
        min="0"
        value={formData.committedHours}
        onChange={handleChange}
      />

      <button type="submit">➕ Add Volunteer</button>

      {created && (
        <p style={{ marginTop: "10px", color: "green" }}>
          Volunteer added with pass code: <strong>{getPassCode(formData.committedHours)}</strong>
        </p>
      )}
    </form>
  );
}
