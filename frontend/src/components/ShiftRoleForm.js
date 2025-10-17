import React, { useState } from "react";

export default function ShiftRoleForm({ onRoleCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    responsibilities: "",
    physicalRequirements: "",
    pointOfContact: "",
    contactPhone: "",
    description: "",
    requirements: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiBase = process.env.REACT_APP_API_BASE;
      if (!apiBase) {
        throw new Error("REACT_APP_API_BASE is not defined");
      }
      const res = await fetch(`${apiBase}/api/shiftroles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newRole = await res.json();
        console.log("Role created successfully:", newRole);
        onRoleCreated(newRole);
        
        // Reset form
        setFormData({
          name: "",
          location: "",
          responsibilities: "",
          physicalRequirements: "",
          pointOfContact: "",
          contactPhone: "",
          description: "",
          requirements: "",
        });
      } else {
        const errorText = await res.text();
        console.error("Failed to create role:", errorText);
      }
    } catch (err) {
      console.error("Network error submitting role:", err);
    }
  };

  return (
    <form className="shift-form" onSubmit={handleSubmit}>
      <h2>Add New Shift Role</h2>
      
      <label htmlFor="name">Name:</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      
      <label htmlFor="location">Location:</label>
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
      />
      
      <label htmlFor="description">Description:</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
      />
      
      <label htmlFor="responsibilities">Responsibilities:</label>
      <textarea
        name="responsibilities"
        value={formData.responsibilities}
        onChange={handleChange}
      />
      
      <label htmlFor="requirements">Requirements (optional):</label>
      <textarea
        name="requirements"
        value={formData.requirements}
        onChange={handleChange}
      />
      
      <label htmlFor="physicalRequirements">Physical Requirements:</label>
      <textarea
        name="physicalRequirements"
        value={formData.physicalRequirements}
        onChange={handleChange}
      />
      
      <label htmlFor="pointOfContact">Point of Contact Name:</label>
      <input
        type="text"
        name="pointOfContact"
        value={formData.pointOfContact}
        onChange={handleChange}
      />
      
      <label htmlFor="contactPhone">Contact Phone (optional):</label>
      <input
        type="tel"
        name="contactPhone"
        value={formData.contactPhone}
        onChange={handleChange}
        placeholder="e.g. 555-123-4567"
      />
      
      <button type="submit">➕ Add Role</button>
    </form>
  );
}