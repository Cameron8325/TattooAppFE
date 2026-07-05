// src/App.js
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import UserManagementPage from "./pages/UserManagementPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import AppointmentCalendarPage from "./pages/AppointmentCalendarPage";
import BillingReportsPage from "./pages/BillingReportsPage";
import { AuthContext, AuthProvider } from "./context/authContext";

// "/" routes users to their workspace; guests to login.
const HomeRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={user.role === "admin" ? "/dashboard" : "/employee-dashboard"}
      replace
    />
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        {/* Any authenticated user */}
        <Route path="/appointments" element={
          <ProtectedRoute><AppointmentsPage /></ProtectedRoute>
        } />
        <Route path="/appointment-calendar" element={
          <ProtectedRoute><AppointmentCalendarPage /></ProtectedRoute>
        } />

        {/* Admin only */}
        <Route path="/register" element={
          <ProtectedRoute roles={["admin"]}><RegisterPage /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/user-management" element={
          <ProtectedRoute roles={["admin"]}><UserManagementPage /></ProtectedRoute>
        } />
        <Route path="/billing-reports" element={
          <ProtectedRoute roles={["admin"]}><BillingReportsPage /></ProtectedRoute>
        } />

        {/* Employee only */}
        <Route path="/employee-dashboard" element={
          <ProtectedRoute roles={["employee"]}><EmployeeDashboard /></ProtectedRoute>
        } />

        {/* Home + catch-all */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
