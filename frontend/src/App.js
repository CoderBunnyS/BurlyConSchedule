import React from "react";
import { Routes, Route } from "react-router-dom";
import ClassList from "./components/ClassList";
import AdminPanel from "./components/AdminPanel";
// import VolunteerShifts from "./components/VolunteerShifts";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ClassList />} />
      <Route path="/admin" element={<AdminPanel />} />
      {/* <Route path="/volunteer" element={<VolunteerShifts />} /> */}
    </Routes>
  );
}

export default App;
