import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AppointmentsPage from './pages/AppointmentsPage';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
    return (
        <Router>
            <Switch>
                <Route exact path="/login" component={LoginPage} />
                <Route exact path="/appointments" component={AppointmentsPage} />
                <Route exact path="/dashboard" component={AdminDashboard} />
                <Route path="/" render={() => <h1>Welcome to the Tattoo Appointment App</h1>} />
            </Switch>
        </Router>
    );
};

export default App;
