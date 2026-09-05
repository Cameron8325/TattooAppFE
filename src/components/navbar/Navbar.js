import React, { useContext, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import DesignServicesOutlinedIcon from '@mui/icons-material/DesignServicesOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';

export const DRAWER_WIDTH = 244;

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', to: '/dashboard', roles: ['admin'], icon: DashboardOutlinedIcon },
      { label: 'My day', to: '/employee-dashboard', roles: ['employee'], icon: DashboardOutlinedIcon },
      { label: 'Calendar', to: '/appointment-calendar', roles: ['admin', 'employee'], icon: CalendarMonthOutlinedIcon },
      { label: 'Appointments', to: '/appointments', roles: ['admin', 'employee'], icon: EventNoteOutlinedIcon },
      { label: 'Clients', to: '/clients', roles: ['admin', 'employee'], icon: PeopleAltOutlinedIcon },
    ],
  },
  {
    label: 'Studio',
    items: [
      { label: 'Team', to: '/user-management', roles: ['admin'], icon: BadgeOutlinedIcon },
      { label: 'Services', to: '/services', roles: ['admin'], icon: DesignServicesOutlinedIcon },
      { label: 'Billing', to: '/billing-reports', roles: ['admin'], icon: ReceiptLongOutlinedIcon },
    ],
  },
];

const getInitials = (user) => {
  const source = user.full_name || user.username || 'User';
  return source.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return (
      <Box component="header" sx={{ position: 'absolute', top: 0, left: 0, zIndex: 2, p: { xs: 2, md: 3 } }}>
        <Stack component={Link} to="/" direction="row" spacing={1.25} alignItems="center" sx={{ textDecoration: 'none', color: { xs: 'text.primary', md: 'common.white' } }}>
          <Box sx={{ width: 30, height: 30, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center', borderRadius: 1, fontSize: 11, fontWeight: 800, letterSpacing: '-0.04em' }}>IM</Box>
          <Typography variant="h6">Imaginarium</Typography>
        </Stack>
      </Box>
    );
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'studio.nav', color: 'common.white' }}>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ px: 2.5, height: 72 }}>
        <Box sx={{ width: 34, height: 34, bgcolor: 'primary.main', display: 'grid', placeItems: 'center', borderRadius: 1, fontSize: 11, fontWeight: 800, letterSpacing: '-0.04em' }}>IM</Box>
        <Box>
          <Typography variant="h6" sx={{ color: 'common.white', lineHeight: 1.15 }}>Imaginarium</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.58)' }}>Studio operations</Typography>
        </Box>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => item.roles.includes(user.role));
          if (!items.length) return null;
          return (
            <Box key={group.label} sx={{ mb: 1.5 }}>
              <Typography variant="overline" sx={{ display: 'block', px: 2.5, py: 1, color: 'rgba(255,255,255,0.42)' }}>{group.label}</Typography>
              <List disablePadding>
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.to;
                  return (
                    <ListItemButton
                      key={item.to}
                      component={Link}
                      to={item.to}
                      selected={active}
                      onClick={() => setMobileOpen(false)}
                      sx={{
                        mx: 1.25,
                        mb: 0.25,
                        minHeight: 42,
                        borderRadius: 1,
                        color: active ? 'common.white' : 'rgba(255,255,255,0.68)',
                        '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' },
                        '&.Mui-selected:hover, &:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : 'inherit' }}><Icon fontSize="small" /></ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 600 }} />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ p: 1.25 }}>
        <ListItemButton onClick={() => { setMobileOpen(false); logout(); }} sx={{ borderRadius: 1, color: 'rgba(255,255,255,0.68)' }}>
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Sign out" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ ml: { md: `${DRAWER_WIDTH}px` }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.96)' }}
      >
        <Toolbar sx={{ minHeight: '72px !important', px: { xs: 2, md: 3 } }}>
          <IconButton aria-label="Open navigation" onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' }, mr: 1 }}><MenuIcon /></IconButton>
          <Typography variant="subtitle1" sx={{ flexGrow: 1, color: 'text.secondary' }}>Imaginarium Tattoo Studio</Typography>
          <Tooltip title="Create appointment">
            <IconButton aria-label="Create appointment" onClick={() => navigate('/appointments?new=true')} sx={{ mr: 1, color: 'primary.main', bgcolor: 'primary.bg' }}><AddIcon /></IconButton>
          </Tooltip>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{user.full_name || user.username}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>{user.role}</Typography>
            </Box>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontSize: 13, fontWeight: 800 }}>{getInitials(user)}</Avatar>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" aria-label="Primary navigation" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 0 } }}>{drawer}</Drawer>
        <Drawer variant="permanent" open sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 0 } }}>{drawer}</Drawer>
      </Box>
    </>
  );
};

export default Navbar;
