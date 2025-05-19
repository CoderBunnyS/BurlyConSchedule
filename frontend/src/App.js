import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import VolunteerShifts from "./components/VolunteerShifts";
//import AdminPanel from "./components/AdminPanel";
import AdminDashboard from "./components/AdminDashboard";
import AdminRoles from "./components/AdminRoles";
import UserProfile from "./components/UserProfile";
import AdminShiftOverview from "./components/AdminShiftOverview";
import AdminVolunteers from "./components/AdminVolunteers";
import AdminHourlyNeeds from "./components/AdminHourlyNeeds";
import Callback from "./components/Callback";
import OAuthCallback from "./components/OAuthCallback";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/volunteer" element={<VolunteerShifts />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/shifts" element={<AdminShiftOverview />} />
      <Route path="/admin/roles" element={<AdminRoles />} />
      <Route path="/admin/volunteers" element={<AdminVolunteers />} />
      <Route path="/admin/hourly-needs" element={<AdminHourlyNeeds />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />

      {/* Uncomment the line below when AdminPanel is ready */}
      {/* <Route path="/admin/panel" element={<AdminPanel />} /> */}
    </Routes>
  );
}

export default App;
