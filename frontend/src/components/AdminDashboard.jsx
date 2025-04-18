import Header from "./Header";

export default function AdminDashboard() {
  return (
    <div className="page-container">
      <Header />
      <h1 className="page-title">Admin Dashboard</h1>
      <p>Welcome! Use the links below to manage the convention schedule:</p>
      <ul className="admin-nav">
        <li><a href="/admin/shifts">📅 Manage Shifts</a></li>
        <li><a href="/admin/roles">🛠️ Manage Volunteer Roles</a></li>
        {/* Future: <li><a href="/admin/volunteers">👥 View Volunteers</a></li> */}
      </ul>
    </div>
  );
}
