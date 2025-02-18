// AdminDashboard.js
import { Grid, Paper, Typography, Box } from '@mui/material';
import AppointmentsChart from '../components/adminDash/AppointmentsChart';
import KeyMetricsCard from '../components/adminDash/KeyMetricsCard';
import ArtistPerformanceChart from '../components/adminDash/ArtistPerformanceChart';
import NotificationsPanel from '../components/adminDash/NotificationsPanel';
import AppointmentOverview from '../components/adminDash/AppointmentOverview';

const AdminDashboard = () => {

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <NotificationsPanel />
          </Paper>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Key Metrics
            </Typography>
            <KeyMetricsCard />
          </Paper>
        </Grid>

        {/* Appointment Overview */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Appointment Overview
            </Typography>
            <AppointmentOverview />
          </Paper>
        </Grid>

        {/* Appointment Trends */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Appointment Trends
            </Typography>
            <AppointmentsChart />
          </Paper>
        </Grid>

        {/* Artist Performance */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Artist Performance
            </Typography>
            <ArtistPerformanceChart />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
