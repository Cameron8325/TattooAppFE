// src/components/navbar/Navbar.js
import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext"

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Tattoo Appointment App
        </Typography>

        {/* Only show these links if user is logged in */}
        {user ? (
          <Box>
            <Button color="inherit" component={Link} to="/appointments">
              Appointments
            </Button>
            <Button color="inherit" component={Link} to="/appointment-calendar">
              Calendar
            </Button>

            {/* Admin-only pages */}
            {user.role === "admin" && (
              <>
            <Button color="inherit" component={Link} to="/dashboard">
              Dashboard
            </Button>
                <Button color="inherit" component={Link} to="/user-management">
                  Users
                </Button>
                <Button color="inherit" component={Link} to="/billing-reports">
                  Billing Reports
                </Button>
              </>
            )}

            {/* Employee-only pages */}
            {user.role === "employee" && (
              <Button color="inherit" component={Link} to="/employee-dashboard">
                Employee Dashboard
              </Button>
            )}

            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </Box>
        ) : (
          // Show Login/Register only if user is not logged in
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
