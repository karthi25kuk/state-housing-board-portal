import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

// ======================================================
// GENERAL PAGES
// ======================================================

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

// ======================================================
// APPLICANT PAGES
// ======================================================

import ApplicantDashboard from "./pages/Applicant/ApplicantDashboard";
import ApplyScheme from "./pages/Applicant/ApplyScheme";
import MyAllotments from "./pages/Applicant/MyAllotments";
import ApplicantSchemes from "./pages/Applicant/ApplicantSchemes";
import MyApplications from "./pages/Applicant/MyApplications";
import ApplicantApplicationDetails from "./pages/Applicant/ApplicantApplicationDetails";
import ApplicantWaitingList from "./pages/Applicant/ApplicantWaitingList";

// ======================================================
// ADMIN PAGES
// ======================================================

import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminCreateScheme from "./pages/admin/CreateScheme";
import CreateOfficer from "./pages/admin/CreateOfficer";

// ======================================================
// OFFICER PAGES
// ======================================================

import OfficerDashboard from "./pages/OfficerDashboard/OfficerDashboard";
import OfficerSchemes from "./pages/officer/OfficerSchemes";
import OfficerSchemeDetails from "./pages/officer/OfficerSchemeDetails";
import OfficerApplications from "./pages/officer/OfficerApplications";
import OfficerApplicationDetails from "./pages/officer/OfficerApplicationDetails";

// ======================================================
// APP
// ======================================================

const App = () => {
  return (
    <Router>
      <Routes>

        {/* ==================================================
            GENERAL ROUTES
        ================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ==================================================
            ADMIN DASHBOARD
        ================================================== */}

        <Route
          path="/admindashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
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

        {/* ==================================================
            ADMIN - CREATE HOUSING SCHEME
        ================================================== */}

        <Route
          path="/admin/schemes/create"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminCreateScheme />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            ADMIN - CREATE OFFICER SCHEME
        ================================================== */}

        <Route
          path="/admin/officers/create"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <CreateOfficer />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            APPLICANT DASHBOARD
        ================================================== */}

        <Route
          path="/applicant"
          element={
            <ProtectedRoute allowedRoles={["APPLICANT"]}>
              <ApplicantDashboard />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            APPLICANT - VIEW SCHEMES
        ================================================== */}

        <Route
          path="/applicant/schemes"
          element={
            <ProtectedRoute allowedRoles={["APPLICANT"]}>
              <ApplicantSchemes />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            APPLICANT - APPLY
        ================================================== */}

        <Route
          path="/applicant/apply/:schemeId"
          element={
            <ProtectedRoute allowedRoles={["APPLICANT"]}>
              <ApplyScheme />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            APPLICANT - APPLICATIONS
        ================================================== */}

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

        {/* ==================================================
            APPLICANT - WAITING LIST
        ================================================== */}

        <Route
          path="/applicant/waiting-list"
          element={
            <ProtectedRoute allowedRoles={["APPLICANT"]}>
              <ApplicantWaitingList />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            APPLICANT - ALLOTMENTS
        ================================================== */}

        <Route
          path="/dashboard/allotments"
          element={
            <ProtectedRoute allowedRoles={["APPLICANT"]}>
              <MyAllotments />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            OFFICER DASHBOARD
        ================================================== */}

        <Route
          path="/officer"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            OFFICER - ASSIGNED SCHEMES
        ================================================== */}

        <Route
          path="/officer/schemes"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerSchemes />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            OFFICER - SCHEME DETAILS / CONFIGURATION
        ================================================== */}

        <Route
          path="/officer/schemes/:schemeId"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerSchemeDetails />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            OFFICER - APPLICATIONS
        ================================================== */}

        <Route
          path="/officer/applications"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/officer/applications/:applicationId"
          element={
            <ProtectedRoute allowedRoles={["OFFICER"]}>
              <OfficerApplicationDetails />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            PROFILE
            ALL ROLES
        ================================================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                "APPLICANT",
                "OFFICER",
                "ADMIN",
              ]}
            >
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            NOTIFICATIONS
            ALL ROLES
        ================================================== */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              allowedRoles={[
                "APPLICANT",
                "OFFICER",
                "ADMIN",
              ]}
            >
              <Notifications />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
};

export default App;