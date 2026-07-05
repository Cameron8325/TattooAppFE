import React from 'react';
import { Grid, Typography } from '@mui/material';
import PageContainer from '../components/layout/PageContainer';
import Section from '../components/layout/Section';
import UpcomingAppointments from '../components/employeeDash/UpcomingAppointments';

const EmployeeDashboard = () => (
  <PageContainer title="Employee Dashboard">
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Section title="Upcoming Appointments">
          <UpcomingAppointments />
        </Section>
      </Grid>

      <Grid item xs={12} md={6}>
        <Section title="Task Reminders">
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            No reminders for now. Check back later!
          </Typography>
        </Section>
      </Grid>
    </Grid>
  </PageContainer>
);

export default EmployeeDashboard;
