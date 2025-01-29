import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { NavLink, useHistory } from "react-router-dom";
import { logout } from "../../services/authService"; // Ensure logout works

const Navbar = () => {
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await logout();
      history.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Tattoo Appointment App
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" component={NavLink} to="/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={NavLink} to="/appointments">
            Appointments
          </Button>
          <Button color="inherit" component={NavLink} to="/appointment-calendar">
            Calendar
          </Button>
          <Button color="inherit" component={NavLink} to="/billing-reports">
            Billing Reports
          </Button>
          <Button color="inherit" component={NavLink} to="/user-management">
            Users
          </Button>
          <Button color="inherit" component={NavLink} to="/employee-dashboard">
            Employees
          </Button>
          <Button color="inherit" component={NavLink} to="/access-denied">
            Access Denied
          </Button>
          <Button color="inherit" component={NavLink} to="/login">
            Login
          </Button>
          <Button color="inherit" component={NavLink} to="/register">
            Register
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
