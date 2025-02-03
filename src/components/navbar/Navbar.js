import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink } from "react-router-dom";
import { logout, getUser } from "../../services/authService";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ✅ Track login state
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [role, setRole] = useState('employee');

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await getUser();
        setIsAuthenticated(true);
        setRole(user.data.role)
      } catch {
        setIsAuthenticated(false);
        setRole(null);
      }
    };
    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      window.location.href = "/login"; // ✅ Ensure proper state reset
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleDrawer = (open) => () => {
    setMobileOpen(open);
  };

  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Appointments", path: "/appointments" },
    { label: "Calendar", path: "/appointment-calendar" },
    { label: "Billing Reports", path: "/billing-reports" },
    { label: "Users", path: "/user-management" },
    { label: "Employees", path: "/employee-dashboard" },
  ];

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <Typography variant="h6" sx={{ flexGrow: 1, whiteSpace: "nowrap" }}>
          Tattoo Appointment App
        </Typography>

        {/* Mobile Menu */}
        {isSmallScreen ? (
          <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, overflow: "auto" }}>
            {navLinks.map((link) => (
              <Button key={link.path} color="inherit" component={NavLink} to={link.path}>
                {link.label}
              </Button>
            ))}
            {isAuthenticated ? (
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Button color="inherit" component={NavLink} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={NavLink} to="/register">
                  Register
                </Button>
              </>
            )}
          </Box>
        )}

        {/* Drawer for Mobile Navigation */}
        <Drawer anchor="left" open={mobileOpen} onClose={toggleDrawer(false)}>
          <List sx={{ width: 250 }}>
            {navLinks.map((link) => (
              <ListItem button key={link.path} component={NavLink} to={link.path} onClick={toggleDrawer(false)}>
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
            {isAuthenticated ? (
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            ) : (
              <>
                <ListItem button component={NavLink} to="/login" onClick={toggleDrawer(false)}>
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem button component={NavLink} to="/register" onClick={toggleDrawer(false)}>
                  <ListItemText primary="Register" />
                </ListItem>
              </>
            )}
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
