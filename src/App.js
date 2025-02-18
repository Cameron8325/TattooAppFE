import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import UserManagementPage from "./pages/UserManagementPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import AppointmentCalendarPage from "./pages/AppointmentCalendarPage";
import BillingReportsPage from "./pages/BillingReportsPage";
import { AuthProvider } from "./context/authContext";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/user-management" element={<UserManagementPage />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/appointment-calendar" element={<AppointmentCalendarPage />} />
          <Route path="/billing-reports" element={<BillingReportsPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="/" element={<h1>Welcome to the Tattoo Appointment App</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
