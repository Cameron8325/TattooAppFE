import { Box, Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Section from '../components/layout/Section';
import AppointmentsChart from '../components/adminDash/AppointmentsChart';
import KeyMetricsCard from '../components/adminDash/KeyMetricsCard';
import ArtistPerformanceChart from '../components/adminDash/ArtistPerformanceChart';
import NotificationsPanel from '../components/adminDash/NotificationsPanel';
import AppointmentOverview from '../components/adminDash/AppointmentOverview';

const todayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

const AdminDashboard = () => (
  <PageContainer
    eyebrow="Overview"
    title="Studio dashboard"
    subtitle={todayLabel}
    actions={<Button component={Link} to="/appointments?new=true" variant="contained" startIcon={<AddIcon />}>New appointment</Button>}
  >
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="end" sx={{ mb: 1.5 }}>
        <Box><Typography variant="h6">Business snapshot</Typography><Typography variant="caption" sx={{ color: 'text.secondary' }}>Completed work only</Typography></Box>
      </Stack>
      <KeyMetricsCard />
    </Box>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(310px, 1fr)' }, gap: 2.5, alignItems: 'start' }}>
      <Box sx={{ display: 'grid', gap: 2.5 }}>
        <Section title="Appointment pulse" subtitle="How bookings are moving through the studio"><AppointmentOverview /></Section>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 2.5 }}>
          <Section title="Booking trend" subtitle="Scheduled dates from the last 30 days onward"><AppointmentsChart /></Section>
          <Section title="Artist workload" subtitle="Appointment volume by artist"><ArtistPerformanceChart /></Section>
        </Box>
      </Box>
      <Section
        title="Approval queue"
        subtitle="Employee-created and changed appointments"
        action={<Button component={Link} to="/appointments" size="small" endIcon={<ArrowForwardIcon />}>All bookings</Button>}
      >
        <NotificationsPanel />
      </Section>
    </Box>
  </PageContainer>
);

export default AdminDashboard;
