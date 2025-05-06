import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../services/axios';
import { AuthContext } from '../context/authContext';
import AppointmentModal from '../components/adminDash/AppointmentModal';

// Helpers for formatting
const formatDate = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
};
const formatTime = timeStr => {
  if (!timeStr) return '';
  let [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
};

const AppointmentsPage = () => {
  const { user, loading } = useContext(AuthContext);

  // ── Hooks (always run) ─────────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [openModal, setOpenModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAppointments = useCallback(() => {
    const url = `/appointments/${showArchived ? '?archived=true' : ''}`;
    axios.get(url)
      .then(res => setAppointments(res.data))
      .catch(() => {
        setSnackbar({ open: true, message: 'Error fetching appointments', severity: 'error' });
      });
  }, [showArchived]);

  useEffect(() => {
    if (user?.role === 'admin') {
      axios.get('/users/?role=employee')
        .then(res => setEmployees(res.data))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);
  // ────────────────────────────────────────────────────────────────

  // don’t render until auth state is known
  if (loading) return null;
  if (!user) return null;

  // Handlers
  const handleOpenModal = appt => {
    setModalData(appt || null);
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);
  const handleSave = () => {
    fetchAppointments();
    setOpenModal(false);
    setSnackbar({
      open: true,
      message: modalData ? 'Appointment updated' : 'Appointment created',
      severity: 'success'
    });
  };
  const handleDelete = id => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    axios.delete(`/appointments/${id}/`)
      .then(() => {
        fetchAppointments();
        setSnackbar({ open: true, message: 'Appointment deleted', severity: 'info' });
      })
      .catch(() => {
        setSnackbar({ open: true, message: 'Error deleting appointment', severity: 'error' });
      });
  };
  const handleCloseSnackbar = () => setSnackbar(s => ({ ...s, open: false }));

  // Prepare rows
  const formatted = appointments.map(a => ({
    id: a.id,
    clientName: a.client
      ? `${a.client.first_name} ${a.client.last_name}`
      : 'N/A',
    employeeName: a.employee_name || 'N/A',
    employeeId: a.employee,           // for filter
    service: a.service_display || 'N/A',
    date: formatDate(a.date),
    time: formatTime(a.time),
    endTime: formatTime(a.end_time),
    price: a.price ?? 0,
    status: a.status || 'N/A',
  }));

  // Apply employee filter
  const rows = formatted.filter(
    r => selectedEmployee === 'all' || r.employeeId === selectedEmployee
  );

  // Columns
  const columns = [
    { field: 'clientName', headerName: 'Client', width: 150 },
    { field: 'employeeName', headerName: 'Employee', width: 150 },
    { field: 'service', headerName: 'Service', width: 150 },
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'time', headerName: 'Start Time', width: 130 },
    { field: 'endTime', headerName: 'End Time', width: 130 },
    { field: 'price', headerName: 'Price', width: 100, type: 'number' },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: params => (
        <Box>
          <Button
            size="small"
            onClick={() => handleOpenModal(params.row)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Appointments
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant={!showArchived ? 'contained' : 'outlined'}
          onClick={() => setShowArchived(false)}
        >
          Upcoming
        </Button>
        <Button
          variant={showArchived ? 'contained' : 'outlined'}
          onClick={() => setShowArchived(true)}
        >
          Archived
        </Button>

        {user.role === 'admin' && (
          <FormControl size="small">
            <InputLabel>Employee</InputLabel>
            <Select
              label="Employee"
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
            >
              <MenuItem value="all">All Employees</MenuItem>
              {employees.map(emp => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.username || emp.full_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="contained" onClick={() => handleOpenModal(null)}>
          Create Appointment
        </Button>
      </Box>

      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={7}
          rowsPerPageOptions={[7]}
          disableSelectionOnClick
        />
      </div>

      <AppointmentModal
        open={openModal}
        initialData={modalData}
        onClose={handleCloseModal}
        onSave={handleSave}
        user={user}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AppointmentsPage;
