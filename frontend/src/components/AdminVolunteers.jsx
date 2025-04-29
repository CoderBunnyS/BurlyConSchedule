import React, { useEffect, useState } from "react";
import Header from "./Header";
import "../styles/admin.css";
import AddVolunteerForm from "./AddVolunteerForm";


export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE}/api/admin/volunteers`)
      .then((res) => res.json())
      .then((data) => setVolunteers(data))
      .catch((err) => console.error("Error fetching volunteers:", err));
  }, []);

  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">Volunteer Roster</h1>

      {volunteers.length === 0 ? (
       <div> <p>No volunteers found.</p>
       <details className="accordion" style={{ marginTop: "40px" }}>
  <summary>➕ Manually Add a Volunteer</summary>
  <div className="accordion-content">
    <AddVolunteerForm onVolunteerCreated={(data) => console.log("Created volunteer:", data)} />
  </div>
</details></div>

        
      ) : (
        <div className="volunteer-list">
          {volunteers.map((vol) => (
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
          <details className="accordion" style={{ marginTop: "40px" }}>
  <summary>➕ Manually Add a Volunteer</summary>
  <div className="accordion-content">
    <AddVolunteerForm onVolunteerCreated={(data) => console.log("Created volunteer:", data)} />
  </div>
</details>
        </div>
      )}
    </div>
  );
}
