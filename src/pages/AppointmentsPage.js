import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import axios from '../services/axios';
import PageContainer from '../components/layout/PageContainer';
import { AuthContext } from '../context/authContext';
import AppointmentModal from '../components/adminDash/AppointmentModal';
import { STATUS_LABELS } from '../constants';
import { statusTokens } from '../theme';
import { formatDate, formatTime } from '../utils/dateTime';

const AppointmentsPage = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [view, setView] = useState('upcoming');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [query, setQuery] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAppointments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (view === 'archived') params.set('archived', 'true');
      if (user?.role === 'admin' && selectedEmployee !== 'all') params.set('employee', selectedEmployee);
      const { data } = await axios.get(`/appointments/?${params.toString()}`);
      setAppointments(data);
    } catch {
      setSnackbar({ open: true, message: 'Appointments could not be loaded.', severity: 'error' });
    }
  }, [selectedEmployee, user?.role, view]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);
  useEffect(() => {
    if (user?.role === 'admin') axios.get('/users/?role=employee').then(({ data }) => setEmployees(data)).catch(() => {});
  }, [user]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('new') === 'true') {
      setModalData(null);
      setOpenModal(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return appointments
      .filter((appointment) => {
        if (!needle) return true;
        return [
          appointment.client?.first_name,
          appointment.client?.last_name,
          appointment.employee_name,
          appointment.service_display,
          appointment.status,
        ].join(' ').toLowerCase().includes(needle);
      })
      .map((appointment) => ({
        id: appointment.id,
        client: `${appointment.client?.first_name || ''} ${appointment.client?.last_name || ''}`.trim() || 'Unknown client',
        employee: appointment.employee_name || 'Unassigned',
        service: appointment.service_display || appointment.service,
        schedule: `${formatDate(appointment.date)} · ${formatTime(appointment.time)}`,
        price: Number(appointment.price || 0),
        status: appointment.status,
        deposit: appointment.deposit_required ? (appointment.deposit_paid ? 'Paid' : 'Due') : 'None',
        source: appointment,
      }));
  }, [appointments, query]);

  const handleDelete = async (appointment) => {
    const name = `${appointment.client?.first_name || ''} ${appointment.client?.last_name || ''}`.trim();
    if (!window.confirm(`Delete ${name}'s appointment? This cannot be undone.`)) return;
    try {
      await axios.delete(`/appointments/${appointment.id}/`);
      setSnackbar({ open: true, message: 'Appointment deleted.', severity: 'success' });
      fetchAppointments();
    } catch {
      setSnackbar({ open: true, message: 'Appointment could not be deleted.', severity: 'error' });
    }
  };

  const columns = [
    { field: 'client', headerName: 'Client', minWidth: 140, flex: 1.1 },
    { field: 'employee', headerName: 'Artist', minWidth: 125, flex: 1 },
    { field: 'service', headerName: 'Service', minWidth: 90, flex: 0.75 },
    { field: 'schedule', headerName: 'Date & time', minWidth: 165, flex: 1.1 },
    { field: 'price', headerName: 'Price', width: 88, valueFormatter: (value) => `$${Number(value).toFixed(2)}` },
    {
      field: 'deposit', headerName: 'Deposit', width: 84,
      renderCell: ({ value }) => <Chip size="small" label={value} variant="outlined" color={value === 'Paid' ? 'success' : value === 'Due' ? 'warning' : 'default'} />,
    },
    {
      field: 'status', headerName: 'Status', width: 105,
      renderCell: ({ value }) => {
        const token = statusTokens[value] || statusTokens.no_show;
        return <Chip size="small" label={value === 'pending' ? 'Pending' : STATUS_LABELS[value] || value} sx={{ bgcolor: token.bg, color: token.text }} />;
      },
    },
    {
      field: 'actions', headerName: '', width: 80, sortable: false, filterable: false, align: 'right',
      renderCell: ({ row }) => (
        <Stack direction="row">
          <Tooltip title="Edit appointment"><IconButton aria-label={`Edit appointment for ${row.client}`} size="small" onClick={() => { setModalData(row.source); setOpenModal(true); }}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete appointment"><IconButton aria-label={`Delete appointment for ${row.client}`} size="small" color="error" onClick={() => handleDelete(row.source)}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <PageContainer
      eyebrow="Schedule"
      title="Appointments"
      subtitle="Review bookings, deposits, status, and artist assignments in one place."
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setModalData(null); setOpenModal(true); }}>New appointment</Button>}
    >
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
        <ToggleButtonGroup exclusive size="small" value={view} onChange={(_, value) => value && setView(value)} aria-label="Appointment timeframe">
          <ToggleButton value="upcoming">Upcoming</ToggleButton>
          <ToggleButton value="archived">Past</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search appointments"
          aria-label="Search appointments"
          sx={{ width: { xs: '100%', sm: 270 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        {user.role === 'admin' && (
          <FormControl sx={{ minWidth: 190 }}>
            <InputLabel>Artist</InputLabel>
            <Select label="Artist" value={selectedEmployee} onChange={(event) => setSelectedEmployee(event.target.value)}>
              <MenuItem value="all">All artists</MenuItem>
              {employees.map((employee) => <MenuItem key={employee.id} value={employee.id}>{employee.full_name || employee.username}</MenuItem>)}
            </Select>
          </FormControl>
        )}
      </Box>

      <Box sx={{ height: 585, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          localeText={{ noRowsLabel: view === 'archived' ? 'No past appointments' : 'No upcoming appointments' }}
        />
      </Box>

      <AppointmentModal
        open={openModal}
        initialData={modalData}
        onClose={() => setOpenModal(false)}
        onSave={() => {
          setOpenModal(false);
          setSnackbar({ open: true, message: user.role === 'employee' ? 'Request submitted for manager approval.' : modalData ? 'Appointment updated.' : 'Appointment created.', severity: 'success' });
          fetchAppointments();
        }}
        user={user}
      />
      <Snackbar sx={{ zIndex: (theme) => theme.zIndex.drawer - 1 }} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default AppointmentsPage;
