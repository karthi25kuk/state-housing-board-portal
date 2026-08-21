import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

import ApplicantDashboard from "./pages/Applicant/ApplicantDashboard";
import ApplyScheme from "./pages/Applicant/ApplyScheme";
import MyAllotments from "./pages/Applicant/MyAllotments";
import ApplicantSchemes from "./pages/Applicant/ApplicantSchemes";
import MyApplications from "./pages/Applicant/MyApplications";
import ApplicantApplicationDetails from "./pages/Applicant/ApplicantApplicationDetails";
import ApplicantWaitingList from "./pages/Applicant/ApplicantWaitingList";

import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";

import OfficerDashboard from "./pages/OfficerDashboard/OfficerDashboard";
import CreateScheme from "./pages/officer/CreateScheme";
import OfficerSchemes from "./pages/officer/OfficerSchemes";
import OfficerSchemeDetails from "./pages/Officer/OfficerSchemeDetails";
import OfficerApplications from "./pages/officer/OfficerApplications";

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
          <Route path="/admindashboard" element={<AdminDashboard />} />

          <Route
            path="/applicant"
            element={
              <ProtectedRoute allowedRoles={["APPLICANT"]}>
                <ApplicantDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applicant/apply/:schemeId"
            element={
              <ProtectedRoute allowedRoles={["APPLICANT"]}>
                <ApplyScheme />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applicant/applications"
            element={
              <ProtectedRoute allowedRoles={["APPLICANT"]}>
                <MyApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applicant/applications/:applicationId"
            element={
              <ProtectedRoute allowedRoles={["APPLICANT"]}>
                <ApplicantApplicationDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/allotments"
            element={
              <ProtectedRoute allowedRoles={["APPLICANT"]}>
                <MyAllotments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applicant/schemes"
            element={
              <ProtectedRoute allowedRoles={["APPLICANT"]}>
                <ApplicantSchemes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/applicant/waiting-list"
            element={
              <ProtectedRoute allowedRoles={["APPLICANT"]}>
                <ApplicantWaitingList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["APPLICANT"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["APPLICANT"]}>
                <Notifications />
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
            path="/officer/schemes/:schemeId"
            element={
              <ProtectedRoute allowedRoles={["OFFICER"]}>
                <OfficerSchemeDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/applications"
            element={
              <ProtectedRoute allowedRoles={["OFFICER"]}>
                <OfficerApplications />
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
