// src/components/navbar/Navbar.js
// Design-system pass (Phase 3): flat bordered AppBar, token-based colors,
// active-route indication, responsive collapse to menu below `md`.
// Self-contained — no other files depend on its internals (rollback-safe).
import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

// Role-aware nav definitions (data, not markup — keeps render logic flat)
const NAV_ITEMS = [
  { label: "Appointments", to: "/appointments", roles: ["admin", "employee"] },
  { label: "Calendar", to: "/appointment-calendar", roles: ["admin", "employee"] },
  { label: "Dashboard", to: "/dashboard", roles: ["admin"] },
  { label: "Users", to: "/user-management", roles: ["admin"] },
  { label: "Billing Reports", to: "/billing-reports", roles: ["admin"] },
  { label: "Employee Dashboard", to: "/employee-dashboard", roles: ["employee"] },
];

// Registration is admin-only; guests only see Login.
const GUEST_ITEMS = [{ label: "Login", to: "/login" }];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { pathname } = useLocation();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const items = user
    ? NAV_ITEMS.filter((item) => item.roles.includes(user.role))
    : GUEST_ITEMS;

  const linkSx = (active) => ({
    color: active ? "primary.main" : "text.secondary",
    backgroundColor: active ? "primary.bg" : "transparent",
    fontWeight: active ? 600 : 500,
    px: 1.5,
  });

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider", backgroundColor: "background.paper" }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, color: "text.primary", textDecoration: "none" }}
        >
          Tattoo Appointment App
        </Typography>

        {/* Desktop: inline buttons */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, alignItems: "center" }}>
          {items.map((item) => {
            const active = pathname === item.to;
            return (
              <Button
                key={item.to}
                component={Link}
                to={item.to}
                aria-current={active ? "page" : undefined}
                sx={linkSx(active)}
              >
                {item.label}
              </Button>
            );
          })}
          {user && (
            <Button onClick={logout} sx={{ color: "text.secondary", px: 1.5 }}>
              Logout
            </Button>
          )}
        </Box>

        {/* Mobile: collapse into menu (Menu keeps its shadow — functional elevation) */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            aria-label="Open navigation menu"
            aria-controls={menuAnchor ? "nav-menu" : undefined}
            aria-expanded={Boolean(menuAnchor)}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ color: "text.primary" }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="nav-menu"
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            {items.map((item) => (
              <MenuItem
                key={item.to}
                component={Link}
                to={item.to}
                selected={pathname === item.to}
                onClick={() => setMenuAnchor(null)}
              >
                {item.label}
              </MenuItem>
            ))}
            {user && (
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  logout();
                }}
              >
                Logout
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
