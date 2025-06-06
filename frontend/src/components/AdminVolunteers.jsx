import React, { useEffect, useState } from "react";
import Header from "./Header";
import "../styles/admin.css";

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/admin/volunteers`)
      .then((res) => res.json())
      .then((data) => setVolunteers(data))
      .catch((err) => console.error("Error fetching volunteers:", err));
  }, []);

  const filteredVolunteers = volunteers.filter((vol) =>
    vol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vol.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">Volunteer Roster</h1>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredVolunteers.length === 0 ? (
        <p>No matching volunteers found.</p>
      ) : (
        <div className="volunteer-list">
          {filteredVolunteers.map((vol) => (
            <div key={vol.id} className="role-card">
              <h3>{vol.name}</h3>
              <p><strong>Email:</strong> {vol.email}</p>
              <p><strong>Total Hours:</strong> {vol.totalHours}</p>
              <h4>Shifts:</h4>
              <ul>
                {vol.shifts.map((s) => (
                  <li key={s.id}>
                    {s.role} – {new Date(s.date).toLocaleDateString()} ({s.startTime}–{s.endTime})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
