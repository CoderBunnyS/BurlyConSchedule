import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import VolunteerShifts from "./components/VolunteerShifts";
import AdminDashboard from "./components/AdminDashboard";
import AdminRoles from "./components/AdminRoles";
import UserProfile from "./components/UserProfile";
import AdminShiftOverview from "./components/AdminShiftOverview";
import AdminVolunteers from "./components/AdminVolunteers";
import AdminHourlyNeeds from "./components/AdminHourlyNeeds";
//import Callback from "./components/Callback";
import OAuthCallback from "./components/OAuthCallback";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/volunteer" element={<VolunteerShifts />} />
      <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/shifts" element={<PrivateRoute><AdminShiftOverview /></PrivateRoute>} />
      <Route path="/admin/roles" element={<PrivateRoute><AdminRoles /></PrivateRoute>} />
      <Route path="/admin/volunteers" element={<PrivateRoute><AdminVolunteers /></PrivateRoute>} />
      <Route path="/admin/hourly-needs" element={<PrivateRoute><AdminHourlyNeeds /></PrivateRoute>} />
      {/* <Route path="/callback" element={<Callback />} /> */}
      <Route path="/oauth-callback" element={<OAuthCallback />} />
    </Routes>
  );
}

export default App;
