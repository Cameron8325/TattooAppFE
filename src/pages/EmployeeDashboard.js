import React, { useContext } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import PageContainer from '../components/layout/PageContainer';
import Section from '../components/layout/Section';
import UpcomingAppointments from '../components/employeeDash/UpcomingAppointments';

const todayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const firstName = user.full_name?.split(' ')[0] || user.username;
  return (
    <PageContainer
      eyebrow="My workspace"
      title={`Good morning, ${firstName}`}
      subtitle={todayLabel}
      actions={<Button component={Link} to="/appointments?new=true" variant="contained" startIcon={<AddIcon />}>New appointment</Button>}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(280px, 0.8fr)' }, gap: 2.5 }}>
        <Section title="Your schedule" subtitle="Select an appointment to review details or update its status"><UpcomingAppointments /></Section>
        <Section title="Quick actions" subtitle="The places you use most">
          <Stack spacing={1}>
            <Button component={Link} to="/appointment-calendar" variant="outlined" startIcon={<CalendarMonthOutlinedIcon />} sx={{ justifyContent: 'flex-start' }}>Open calendar</Button>
            <Button component={Link} to="/appointments" variant="outlined" startIcon={<EventNoteOutlinedIcon />} sx={{ justifyContent: 'flex-start' }}>All appointments</Button>
            <Button component={Link} to="/clients" variant="outlined" startIcon={<PeopleAltOutlinedIcon />} sx={{ justifyContent: 'flex-start' }}>Client directory</Button>
          </Stack>
          <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.bg', borderRadius: 1 }}>
            <Typography variant="overline" sx={{ color: 'warning.text' }}>Approval workflow</Typography>
            <Typography variant="body2" sx={{ color: 'warning.text', mt: 0.5 }}>New bookings and schedule changes are sent to the studio manager for review.</Typography>
          </Box>
        </Section>
      </Box>
    </PageContainer>
  );
};

export default EmployeeDashboard;
