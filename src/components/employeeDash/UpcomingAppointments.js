import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import axios from '../../services/axios';
import { formatDate, formatTime } from '../../utils/dateTime';
import { STATUS_LABELS } from '../../constants';
import { statusTokens } from '../../theme';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('upcoming');
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  const fetchAppointments = useCallback(async () => {
    try {
      const { data } = await axios.get(filter === 'upcoming' ? '/appointments/' : `/appointments/?filter=${filter}`);
      setAppointments(data);
    } catch {
      setMessage('Appointments could not be loaded.');
    }
  }, [filter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const updateStatus = async (status) => {
    try {
      await axios.patch(`/appointments/${selected.id}/reschedule/`, { status });
      setSelected(null);
      setMessage(`Appointment marked ${status.replace('_', ' ')}.`);
      fetchAppointments();
    } catch {
      setMessage('The appointment status could not be updated.');
    }
  };

  return (
    <Box>
      <ToggleButtonGroup exclusive size="small" value={filter} onChange={(_, value) => value && setFilter(value)} aria-label="Appointment period" sx={{ mb: 1 }}>
        <ToggleButton value="today">Today</ToggleButton>
        <ToggleButton value="upcoming">Upcoming</ToggleButton>
      </ToggleButtonGroup>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {appointments.map((appointment, index) => {
          const token = statusTokens[appointment.status] || statusTokens.confirmed;
          return (
            <React.Fragment key={appointment.id}>
              {index > 0 && <Divider />}
              <Box component="li" onClick={() => setSelected(appointment)} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '80px 1fr auto' }, gap: 2, alignItems: 'center', py: 2, cursor: 'pointer', '&:hover .client-name': { color: 'primary.main' } }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{formatTime(appointment.time)}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDate(appointment.date)}</Typography>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography className="client-name" variant="body2" sx={{ fontWeight: 700 }}>{appointment.client?.first_name} {appointment.client?.last_name}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{appointment.service_display || appointment.service} · {formatTime(appointment.time)}-{formatTime(appointment.end_time)}</Typography>
                </Box>
                <Chip size="small" label={STATUS_LABELS[appointment.status] || appointment.status} sx={{ bgcolor: token.bg, color: token.text, justifySelf: 'start' }} />
              </Box>
            </React.Fragment>
          );
        })}
        {!appointments.length && (
          <Stack alignItems="center" spacing={1} sx={{ py: 7, color: 'text.secondary' }}><AccessTimeOutlinedIcon /><Typography variant="body2">No appointments in this period.</Typography></Stack>
        )}
      </Box>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Appointment details</DialogTitle>
        <DialogContent dividers>
          {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
          {selected?.requires_approval && <Alert severity="info" sx={{ mb: 2 }}>This booking is awaiting manager approval.</Alert>}
          {selected && (
            <Stack spacing={2}>
              <Box><Typography variant="overline" sx={{ color: 'text.secondary' }}>Client</Typography><Typography variant="h6">{selected.client?.first_name} {selected.client?.last_name}</Typography></Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box><Typography variant="overline" sx={{ color: 'text.secondary' }}>Service</Typography><Typography variant="body1">{selected.service_display || selected.service}</Typography></Box>
                <Box><Typography variant="overline" sx={{ color: 'text.secondary' }}>Schedule</Typography><Typography variant="body1">{formatDate(selected.date)}, {formatTime(selected.time)}</Typography></Box>
              </Box>
              <Box><Typography variant="overline" sx={{ color: 'text.secondary' }}>Notes</Typography><Typography variant="body1">{selected.notes || 'No notes added.'}</Typography></Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
          <Button color="error" disabled={selected?.requires_approval || selected?.status === 'pending' || selected?.status === 'no_show'} onClick={() => updateStatus('no_show')}>Mark no-show</Button>
          <Button color="success" variant="contained" disabled={selected?.requires_approval || selected?.status === 'pending' || selected?.status === 'completed'} onClick={() => updateStatus('completed')}>Mark completed</Button>
        </DialogActions>
      </Dialog>
      <Snackbar sx={{ zIndex: (theme) => theme.zIndex.drawer - 1 }} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage('')}><Alert onClose={() => setMessage('')} severity="info">{message}</Alert></Snackbar>
    </Box>
  );
};

export default UpcomingAppointments;
