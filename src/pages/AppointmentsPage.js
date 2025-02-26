import React, { useEffect, useState, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Modal, TextField, Typography, Grid } from '@mui/material';
import axios from '../services/axios';

// Helper function to format date in mm/dd/yyyy format
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

// Helper function to format time to 12-hour format with AM/PM
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hourStr, minute] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
};

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    employee: '',
    service: '',
    date: '',
    time: '',
    end_time: '',
    price: '',
    status: '',
    notes: '',
  });

  // Fetch appointments based on whether we're showing archived or upcoming
  const fetchAppointments = useCallback(() => {
    const url = `/appointments/${showArchived ? '?archived=true' : ''}`;
    axios.get(url)
      .then(response => setAppointments(response.data))
      .catch(error => console.error('Error fetching appointments:', error));
  }, [showArchived]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle opening/closing the modal for editing/creating an appointment
  const handleOpenModal = (appointment = null) => {
    setCurrentAppointment(appointment);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setCurrentAppointment(null);
    setOpenModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      client_id: formData.client_id,
      employee: formData.employee,
      service: formData.service,
      date: formData.date,
      time: formData.time,
      end_time: formData.end_time,
      price: formData.price,
      status: formData.status,
      notes: formData.notes,
    };

    if (currentAppointment) {
      axios.put(`/appointments/${currentAppointment.id}/`, payload)
        .then(() => {
          setAppointments(prev =>
            prev.map(item =>
              item.id === currentAppointment.id ? { ...item, ...payload } : item
            )
          );
        })
        .catch(error => console.error('Error updating appointment:', error));
    } else {
      axios.post('/appointments/', payload)
        .then(response => {
          setAppointments(prev => [...prev, response.data]);
        })
        .catch(error => console.error('Error creating appointment:', error));
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    axios.delete(`/appointments/${id}/`)
      .then(() => {
        setAppointments(prev => prev.filter(item => item.id !== id));
      })
      .catch(error => console.error('Error deleting appointment:', error));
  };

  // Prepare appointment data with formatted date/time and full names
  const formattedAppointments = appointments.map(appointment => ({
    id: appointment.id,
    clientName: appointment.client
      ? `${appointment.client.first_name} ${appointment.client.last_name}`
      : 'N/A',
    employeeName: appointment.employee_name || 'N/A',  // Use employee_name from API
    service: appointment.service_display || 'N/A',  // Use service_display for human-readable name
    formattedDate: formatDate(appointment.date),
    formattedTime: formatTime(appointment.time),
    formattedEndTime: formatTime(appointment.end_time),
    price: appointment.price || 0,
    status: appointment.status || 'N/A',
}));


  // Define columns for the DataGrid
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'clientName', headerName: 'Client', width: 150 },
    { field: 'employeeName', headerName: 'Employee', width: 150 },
    { field: 'service', headerName: 'Service', width: 150 },
    { field: 'formattedDate', headerName: 'Date', width: 130 },
    { field: 'formattedTime', headerName: 'Time', width: 130 },
    { field: 'formattedEndTime', headerName: 'End Time', width: 130 },
    { field: 'price', headerName: 'Price', width: 100 },
    { field: 'status', headerName: 'Status', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleOpenModal(params.row)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
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

      {/* Toggle buttons for Upcoming and Archived */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant={!showArchived ? 'contained' : 'outlined'}
          onClick={() => setShowArchived(false)}
          sx={{ mr: 2 }}
        >
          Upcoming
        </Button>
        <Button
          variant={showArchived ? 'contained' : 'outlined'}
          onClick={() => setShowArchived(true)}
        >
          Archived
        </Button>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenModal()}
        sx={{ mb: 2 }}
      >
        Create Appointment
      </Button>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={formattedAppointments}
          columns={columns}
          pageSize={7}
          rowsPerPageOptions={[7]}
          disableSelectionOnClick
        />
      </div>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" marginBottom={2}>
            {currentAppointment ? 'Edit Appointment' : 'Create Appointment'}
          </Typography>
          <form onSubmit={handleFormSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  {currentAppointment ? 'Update Appointment' : 'Create Appointment'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default AppointmentsPage;
