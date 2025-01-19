import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppointmentsPage from './pages/AppointmentsPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard'
import UserManagementPage from './pages/UserManagementPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import AppointmentCalendarPage from './pages/AppointmentCalendarPage';
import BillingReportsPage from './pages/BillingReportsPage';


const App = () => {
    return (
        <Router>
            <Switch>
                <Route exact path="/login" component={LoginPage} />
                <Route exact path="/register" component={RegisterPage} />
                <Route exact path="/appointments" component={AppointmentsPage} />
                <Route exact path="/dashboard" component={AdminDashboard} />
                <Route exact path="/user-management" component={UserManagementPage} />
                <Route exact path="/employee-dashboard" component={EmployeeDashboard} />
                <Route exact path="/appointment-calendar" component={AppointmentCalendarPage} />
                <Route exact path="/billing-reports" component={BillingReportsPage} />
                <Route exact path="/access-denied" component={AccessDeniedPage} />
                <Route path="/" render={() => <h1>Welcome to the Tattoo Appointment App</h1>} />
            </Switch>
        </Router>
    );
};

export default App;
