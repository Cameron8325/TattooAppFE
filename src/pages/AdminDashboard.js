// Uses shared PageContainer + Section shells (design-system layout).
import { Grid } from '@mui/material';
import PageContainer from '../components/layout/PageContainer';
import Section from '../components/layout/Section';
import AppointmentsChart from '../components/adminDash/AppointmentsChart';
import KeyMetricsCard from '../components/adminDash/KeyMetricsCard';
import ArtistPerformanceChart from '../components/adminDash/ArtistPerformanceChart';
import NotificationsPanel from '../components/adminDash/NotificationsPanel';
import AppointmentOverview from '../components/adminDash/AppointmentOverview';

const AdminDashboard = () => (
  <PageContainer title="Admin Dashboard">
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Section title="Notifications">
          <NotificationsPanel />
        </Section>
      </Grid>

      <Grid item xs={12} md={6}>
        <Section title="Key Metrics">
          <KeyMetricsCard />
        </Section>
      </Grid>

      <Grid item xs={12}>
        <Section title="Appointment Overview">
          <AppointmentOverview />
        </Section>
      </Grid>

      <Grid item xs={12} md={6}>
        <Section title="Appointment Trends">
          <AppointmentsChart />
        </Section>
      </Grid>

      <Grid item xs={12} md={6}>
        <Section title="Artist Performance">
          <ArtistPerformanceChart />
        </Section>
      </Grid>
    </Grid>
    {/* TODO(Phase 5): "Archived Appointments" — backend supports
        GET /appointments/?archived=true; add route + view, then link here. */}
  </PageContainer>
);

export default AdminDashboard;
