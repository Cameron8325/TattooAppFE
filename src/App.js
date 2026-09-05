import React, { useContext, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar, { DRAWER_WIDTH } from './components/navbar/Navbar';
import ProtectedRoute from './components/routing/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppointmentsPage from './pages/AppointmentsPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import UserManagementPage from './pages/UserManagementPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import AppointmentCalendarPage from './pages/AppointmentCalendarPage';
import BillingReportsPage from './pages/BillingReportsPage';
import ManageClients from './pages/ManageClients';
import ServiceManagementPage from './pages/ServiceManagementPage';
import { AuthContext, AuthProvider } from './context/authContext';

const HomeRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <Box role="status" sx={{ display: 'grid', justifyItems: 'center', gap: 2, pt: 14 }}><CircularProgress /><Typography>Opening the studio…</Typography>{import.meta.env.VITE_DEMO_MODE === 'true' && <Typography>The free demo server may take about a minute to wake up.</Typography>}</Box>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/dashboard' : '/employee-dashboard'} replace />;
};

const AppFrame = () => {
  const { user } = useContext(AuthContext);
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={user ? { ml: { md: `${DRAWER_WIDTH}px` }, pt: '72px', minHeight: '100vh' } : { minHeight: '100vh' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
          <Route path="/appointment-calendar" element={<ProtectedRoute><AppointmentCalendarPage /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ManageClients /></ProtectedRoute>} />
          <Route path="/register" element={<ProtectedRoute roles={['admin']}><RegisterPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/user-management" element={<ProtectedRoute roles={['admin']}><UserManagementPage /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute roles={['admin']}><ServiceManagementPage /></ProtectedRoute>} />
          <Route path="/billing-reports" element={<ProtectedRoute roles={['admin']}><BillingReportsPage /></ProtectedRoute>} />
          <Route path="/employee-dashboard" element={<ProtectedRoute roles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </Box>
    </Box>
  );
};

const App = () => <AuthProvider><AppFrame /></AuthProvider>;

export default App;
