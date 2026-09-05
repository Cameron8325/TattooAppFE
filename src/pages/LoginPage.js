import React, { useContext, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { getErrorMessage } from '../services/axios';

const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

const LoginPage = () => {
  const { login, user, loading } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  if (!loading && user) return <Navigate to={user.role === 'admin' ? '/dashboard' : '/employee-dashboard'} replace />;

  const signIn = async (details) => {
    setError('');
    setSubmitting(true);
    try {
      const account = await login(details);
      const requestedPath = location.state?.from?.pathname;
      navigate(requestedPath || (account.role === 'admin' ? '/dashboard' : '/employee-dashboard'), { replace: true });
    } catch (failure) {
      setError(failure.response?.status === 401 ? 'That username and password do not match an account.' : getErrorMessage(failure));
    } finally {
      setSubmitting(false);
    }
  };
  const handleSubmit = (event) => { event.preventDefault(); return signIn(credentials); };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(340px, 0.9fr) minmax(480px, 1.1fr)' }, bgcolor: 'background.paper' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: { md: 6, lg: 8 },
          bgcolor: 'studio.nav',
          color: 'common.white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': { content: '""', position: 'absolute', width: 240, height: 240, border: '48px solid', borderColor: 'primary.main', opacity: 0.16, top: -90, right: -70, transform: 'rotate(18deg)' },
        }}
      >
        <Box sx={{ position: 'relative', maxWidth: 480 }}>
          <Typography variant="overline" sx={{ color: 'primary.main' }}>Built for the working studio</Typography>
          <Typography variant="h1" component="h2" sx={{ color: 'common.white', mt: 1, mb: 2 }}>Every appointment, artist, and payout in focus.</Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.62)', mb: 5 }}>A calm command center for the busy parts of tattoo studio operations.</Typography>
          <Stack spacing={2}>
            {[
              [CalendarMonthOutlinedIcon, 'Schedule and approve bookings'],
              [PeopleAltOutlinedIcon, 'Keep client records close'],
              [ReceiptLongOutlinedIcon, 'Reconcile studio and artist earnings'],
            ].map(([Icon, label]) => (
              <Stack key={label} direction="row" spacing={1.5} alignItems="center"><Icon sx={{ color: 'primary.main' }} /><Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{label}</Typography></Stack>
            ))}
          </Stack>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', px: { xs: 3, sm: 6 }, py: 10 }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Typography variant="overline" sx={{ color: 'primary.main' }}>Studio access</Typography>
          <Typography variant="h4" component="h1" sx={{ mt: 0.75 }}>Welcome back</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, mb: 4 }}>Sign in to open your workspace.</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {isDemo && (
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ mb: 2 }}>Explore a sample studio with fictional clients. Demo changes can reset; use sample information.</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button variant="contained" disabled={submitting} onClick={() => signIn({ username: 'admin', password: 'DevSeed123!' })}>Try manager demo</Button>
                <Button variant="outlined" disabled={submitting} onClick={() => signIn({ username: 'mia.torres', password: 'DevSeed123!' })}>Try artist demo</Button>
              </Stack>
              {(loading || submitting) && <Typography role="status" variant="body2" sx={{ mt: 2 }}>The free demo server may take about a minute to wake up.</Typography>}
            </Box>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.25}>
              <TextField label="Username" autoComplete="username" value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} required autoFocus />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={credentials.password}
                onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
                required
                InputProps={{ endAdornment: <InputAdornment position="end"><IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} edge="end" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton></InputAdornment> }}
              />
              <Button type="submit" variant="contained" size="large" disabled={submitting}>{submitting ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}</Button>
            </Stack>
          </Box>
          <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mt: 3 }}>Accounts are created by the studio administrator.</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
