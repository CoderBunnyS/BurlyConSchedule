// components/ShiftRoleForm.js
import React, { useState } from "react";

export default function ShiftRoleForm({ onRoleCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requirements: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5001/api/shiftroles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const newRole = await res.json();
        onRoleCreated(newRole);
        setFormData({ name: "", description: "", requirements: "" });
      } else {
        console.error("Failed to create role");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <form className="shift-form" onSubmit={handleSubmit}>
      <h2>Add New Shift Role</h2>

      <label>Name:</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <label>Description:</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
      />

      <label>Requirements (optional):</label>
      <textarea
        name="requirements"
        value={formData.requirements}
        onChange={handleChange}
      />

      <button type="submit">➕ Add Role</button>
    </form>
  );
}
