import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ApplicantDashboard from "./pages/ApplicantDashboard/ApplicantDashboard";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import OfficerDashboard from "./pages/OfficerDashboard/OfficerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateScheme from "./pages/officer/CreateScheme";
import OfficerSchemes from "./pages/officer/OfficerSchemes";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ApplicantDashboard />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["APPLICANT"]}>
                <ApplicantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer"
            element={
              <ProtectedRoute allowedRoles={["OFFICER"]}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/create-scheme"
            element={
              <ProtectedRoute allowedRoles={["OFFICER"]}>
                <CreateScheme />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/schemes"
            element={
              <ProtectedRoute allowedRoles={["OFFICER"]}>
                <OfficerSchemes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
};
export default App;
