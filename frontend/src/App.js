import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import VolunteerShifts from "./components/VolunteerShifts";
//import AdminPanel from "./components/AdminPanel";
import AdminDashboard from "./components/AdminDashboard";
import AdminShifts from "./components/AdminShifts";
import AdminRoles from "./components/AdminRoles";
import UserProfile from "./components/UserProfile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/volunteer" element={<VolunteerShifts />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/shifts" element={<AdminShifts />} />
      <Route path="/admin/roles" element={<AdminRoles />} />
    </Routes>
  );
}

export default App;
