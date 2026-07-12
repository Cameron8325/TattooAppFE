// Admin Dashboard — 12-column grid ("gallery" layout):
//   ┌──────────────────────────────┬──────────────┐
//   │ Key Metrics            (8)   │ Recent       │
//   ├──────────────────────────────┤ Activity     │
//   │ Appointment Overview   (8)   │ feed (4,     │
//   ├───────────────┬──────────────┤ spans 2 rows)│
//   │ Trends (6)    │ Artists (6)  ├──────────────┘
//   └───────────────┴──────────────┘
// Collapses to a single column below `lg`. Layout/CSS only — data flow
// inside each module is unchanged.
import { Box } from '@mui/material';
import PageContainer from '../components/layout/PageContainer';
import Section from '../components/layout/Section';
import AppointmentsChart from '../components/adminDash/AppointmentsChart';
import KeyMetricsCard from '../components/adminDash/KeyMetricsCard';
import ArtistPerformanceChart from '../components/adminDash/ArtistPerformanceChart';
import NotificationsPanel from '../components/adminDash/NotificationsPanel';
import AppointmentOverview from '../components/adminDash/AppointmentOverview';

const AdminDashboard = () => (
  <PageContainer
    title="Admin Dashboard"
    subtitle="Studio performance, approvals, and activity at a glance"
    maxWidth="xl"
  >
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 3, md: 4 },
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, 1fr)' },
        alignItems: 'stretch',
      }}
    >
      <Box sx={{ gridColumn: { lg: 'span 8' } }}>
        <Section title="Key Metrics" subtitle="Completed revenue and volume">
          <KeyMetricsCard />
        </Section>
      </Box>

      {/* Activity feed: dedicated side column, spans two rows */}
      <Box sx={{ gridColumn: { lg: 'span 4' }, gridRow: { lg: 'span 2' } }}>
        <Section title="Recent Activity" subtitle="Approvals and appointment changes">
          <NotificationsPanel />
        </Section>
      </Box>

      <Box sx={{ gridColumn: { lg: 'span 8' } }}>
        <Section title="Appointment Overview" subtitle="Volume by status">
          <AppointmentOverview />
        </Section>
      </Box>

      <Box sx={{ gridColumn: { lg: 'span 6' } }}>
        <Section title="Appointment Trends" subtitle="Bookings over time">
          <AppointmentsChart />
        </Section>
      </Box>

      <Box sx={{ gridColumn: { lg: 'span 6' } }}>
        <Section title="Artist Performance" subtitle="Appointments per artist">
          <ArtistPerformanceChart />
        </Section>
      </Box>
    </Box>
    {/* TODO(Phase 5): "Archived Appointments" — backend supports
        GET /appointments/?archived=true; add route + view, then link here. */}
  </PageContainer>
);

export default AdminDashboard;
