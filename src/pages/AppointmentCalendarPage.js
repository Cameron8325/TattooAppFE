import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AuthContext } from '../context/authContext';
import axios from '../services/axios';
import AppointmentModal from '../components/adminDash/AppointmentModal';
import PageContainer from '../components/layout/PageContainer';
import { statusTokens } from '../theme';

const localizer = momentLocalizer(moment);
const toDateInput = (date) => moment(date).format('YYYY-MM-DD');
const toTimeInput = (date) => moment(date).format('HH:mm');

const AppointmentCalendarPage = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [draftSlot, setDraftSlot] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [error, setError] = useState('');

  const fetchAppointments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedEmployee !== 'all') params.set('employee', selectedEmployee);
      const { data } = await axios.get(`/appointments/?${params.toString()}`);
      setAppointments(data.map((appointment) => ({
        id: appointment.id,
        title: `${appointment.client?.first_name || 'Client'} · ${appointment.service_display || appointment.service}`,
        start: moment(`${appointment.date}T${appointment.time || '00:00'}`).toDate(),
        end: moment(`${appointment.date}T${appointment.end_time || appointment.time || '01:00'}`).toDate(),
        status: appointment.status,
        source: appointment,
      })));
    } catch {
      setError('The calendar could not be loaded.');
    }
  }, [selectedEmployee]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => {
    if (user?.role === 'admin') axios.get('/users/?role=employee').then(({ data }) => setEmployees(data)).catch(() => {});
  }, [user]);

  const openNew = (slot = null) => {
    setSelectedEvent(null);
    setDraftSlot(slot ? { date: toDateInput(slot.start), startTime: toTimeInput(slot.start), endTime: toTimeInput(slot.end) } : null);
    setOpenModal(true);
  };

  return (
    <PageContainer
      eyebrow="Schedule"
      title="Calendar"
      subtitle="Select an open time to start a booking, or choose an appointment to update it."
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => openNew()}>New appointment</Button>}
    >
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        {user?.role === 'admin' && (
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Artist</InputLabel>
            <Select value={selectedEmployee} label="Artist" onChange={(event) => setSelectedEmployee(event.target.value)}>
              <MenuItem value="all">All artists</MenuItem>
              {employees.map((employee) => <MenuItem key={employee.id} value={employee.id}>{employee.full_name || employee.username}</MenuItem>)}
            </Select>
          </FormControl>
        )}
      </Box>

      <Box
        sx={{
          height: { xs: 650, md: 760 },
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          p: { xs: 1, md: 2 },
          overflow: 'hidden',
          '& .rbc-toolbar': { gap: 1, flexWrap: 'wrap', mb: 2 },
          '& .rbc-toolbar button': { borderColor: 'divider', color: 'text.primary', minHeight: 34 },
          '& .rbc-toolbar button.rbc-active': { bgcolor: 'studio.nav', color: 'common.white', boxShadow: 'none' },
          '& .rbc-header': { py: 1.25, fontSize: 12, textTransform: 'uppercase', color: 'text.secondary' },
          '& .rbc-month-view, & .rbc-time-view': { borderColor: 'divider' },
          '& .rbc-day-bg, & .rbc-header, & .rbc-time-content, & .rbc-timeslot-group': { borderColor: 'divider' },
          '& .rbc-event': { borderRadius: 3, px: 0.75, py: 0.25, fontSize: 12, fontWeight: 700 },
          '& .rbc-today': { bgcolor: 'secondary.bg' },
        }}
      >
        <Calendar
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={openNew}
          onSelectEvent={(event) => { setSelectedEvent(event.source); setDraftSlot(null); setOpenModal(true); }}
          eventPropGetter={(event) => {
            const token = statusTokens[event.status] || statusTokens.confirmed;
            return { style: { backgroundColor: token.bg, color: token.text, border: `1px solid ${token.main}`, borderLeftWidth: 3 } };
          }}
          views={['month', 'week', 'day']}
          defaultView={window.matchMedia('(max-width: 700px)').matches ? 'day' : 'week'}
          min={new Date(0, 0, 0, 8, 0)}
          max={new Date(0, 0, 0, 20, 0)}
          step={30}
          timeslots={2}
          style={{ height: '100%' }}
        />
      </Box>

      <AppointmentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        initialData={selectedEvent}
        draftSlot={draftSlot}
        onSave={() => { setOpenModal(false); fetchAppointments(); }}
        user={user}
      />
    </PageContainer>
  );
};

export default AppointmentCalendarPage;
