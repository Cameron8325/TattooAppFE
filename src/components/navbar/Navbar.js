import React, { useState } from "react";
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
  useMediaQuery,  // ✅ For dynamic responsiveness
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink, useHistory } from "react-router-dom";
import { logout } from "../../services/authService";

const Navbar = () => {
  const history = useHistory();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md")); // ✅ Switches at medium breakpoint (~900px)

  const handleLogout = async () => {
    try {
      await logout();
      history.push("/login");
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
    { label: "Access Denied", path: "/access-denied" },
    { label: "Login", path: "/login" },
    { label: "Register", path: "/register" },
  ];

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between", flexWrap: "wrap" }}> 
        {/* Logo / Title */}
        <Typography variant="h6" sx={{ flexGrow: 1, whiteSpace: "nowrap" }}>
          Tattoo Appointment App
        </Typography>

        {/* Mobile Menu (Uses Drawer when screen is small) */}
        {isSmallScreen ? (
          <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        ) : (
          /* Desktop Menu */
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, overflow: "auto" }}>
            {navLinks.map((link) => (
              <Button key={link.path} color="inherit" component={NavLink} to={link.path}>
                {link.label}
              </Button>
            ))}
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
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
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
