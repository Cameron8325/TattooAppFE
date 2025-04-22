import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Button, Box, Modal, TextField, Typography, Grid, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Autocomplete from '@mui/material/Autocomplete';
import moment from 'moment';
import axios from '../services/axios';
import { getCSRFToken } from '../services/authService';
import { AuthContext } from '../context/authContext';

const formatDate = (dateStr) => moment(dateStr).format('MM/DD/YYYY');
const formatTime = (timeStr) => moment(timeStr, 'HH:mm:ss').format('hh:mm A');

const AppointmentsPage = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [artists, setArtists] = useState([]);
  const [services, setServices] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
    first_name: '', last_name: '', email: '', phone: ''
  });
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [formData, setFormData] = useState({
    employee: '', service: '', price: '', date: '',
    startTime: '', endTime: '', notes: '',
  });

  const fetchAppointments = useCallback(() => {
    axios.get('/appointments/')
      .then(res => setAppointments(res.data))
      .catch(err => console.error(err));
  }, []);

  const fetchDropdownData = useCallback(() => {
    Promise.all([
      axios.get('/users/?role=employee'),
      axios.get('/services/')
    ]).then(([artistsRes, servicesRes]) => {
      setArtists(artistsRes.data);
      setServices(servicesRes.data);
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchDropdownData();
  }, [fetchAppointments, fetchDropdownData]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      axios.get(`/clients/?search=${encodeURIComponent(searchQuery)}`)
        .then(res => setSearchResults(res.data))
        .catch(err => console.error(err));
    } else setSearchResults([]);
  }, [searchQuery]);

  const handleOpenModal = (appt = null) => {
    const fullAppt = appt?.id ? appointments.find(a => a.id === appt.id) : null;
    setCurrentAppointment(fullAppt);

    if (fullAppt) {
      setFormData({
        employee: fullAppt.employee || '',
        service: fullAppt.service || '',
        price: fullAppt.price || '',
        date: fullAppt.date,
        startTime: fullAppt.time?.slice(0, 5) || '',
        endTime: fullAppt.end_time?.slice(0, 5) || '',
        notes: fullAppt.notes || '',
      });
      setSelectedClient(fullAppt.client || null);
      setIsNewClient(false);
    } else {
      setFormData({
        employee: user?.role === 'admin' ? '' : user?.id || '',
        service: '', price: '', date: '',
        startTime: '', endTime: '', notes: '',
      });
      setSelectedClient(null);
      setIsNewClient(false);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setCurrentAppointment(null);
    setOpenModal(false);
  };

  const handleSave = async () => {
    const isAdmin = user?.role === 'admin';
    let requestData = {
      employee: formData.employee,
      service: formData.service,
      price: formData.price,
      date: formData.date,
      time: formData.startTime + ':00',
      end_time: formData.endTime + ':00',
      notes: formData.notes,
      status: isAdmin ? 'confirmed' : 'pending',
      requires_approval: !isAdmin,
    };

    if (isNewClient) {
      if (!newClientData.first_name || !newClientData.last_name || !newClientData.email) {
        alert('Error: New client information is incomplete.');
        return;
      }
      requestData.new_client = {
        ...newClientData,
        employee: formData.employee,
      };
    } else {
      const clientId = selectedClient?.id || currentAppointment?.client?.id;
      if (!clientId) {
        alert('Error: Client information is missing.');
        return;
      }
      requestData.client_id = clientId;
    }

    try {
      if (currentAppointment) {
        await axios.patch(`/appointments/${currentAppointment.id}/reschedule/`, requestData, {
          headers: { 'X-CSRFToken': await getCSRFToken() },
        });
      } else {
        await axios.post('/appointments/', requestData, {
          headers: { 'X-CSRFToken': await getCSRFToken() },
        });
      }
      fetchAppointments();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving appointment:', err);
      alert('Error saving appointment.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`/appointments/${id}/reschedule/`, { status }, {
        headers: { 'X-CSRFToken': await getCSRFToken() },
      });
      fetchAppointments();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const formattedAppointments = appointments.map(appt => ({
    id: appt.id,
    clientName: appt.client ? `${appt.client.first_name} ${appt.client.last_name}` : 'Unknown',
    employeeName: appt.employee_name || 'N/A',
    service: appt.service_display || appt.service || 'N/A',
    formattedDate: formatDate(appt.date),
    formattedTime: formatTime(appt.time),
    formattedEndTime: formatTime(appt.end_time),
    price: appt.price || 0,
    status: appt.status || 'N/A',
  }));

  const columns = [
    { field: 'clientName', headerName: 'Client', width: 150 },
    { field: 'employeeName', headerName: 'Employee', width: 150 },
    { field: 'service', headerName: 'Service', width: 150 },
    { field: 'formattedDate', headerName: 'Date', width: 120 },
    { field: 'formattedTime', headerName: 'Start Time', width: 120 },
    { field: 'formattedEndTime', headerName: 'End Time', width: 120 },
    { field: 'price', headerName: 'Price', width: 100 },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'actions', headerName: 'Actions', width: 280,
      renderCell: ({ row }) => (
        <>
          <Button size="small" onClick={() => handleOpenModal(row)}>Edit</Button>
          <Button size="small" color="success" onClick={() => handleStatusChange(row.id, 'completed')}>Complete</Button>
          <Button size="small" color="error" onClick={() => handleStatusChange(row.id, 'no_show')}>No Show</Button>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Appointments (List View)</Typography>
      <Button variant="contained" onClick={() => handleOpenModal()} sx={{ mb: 2 }}>Create Appointment</Button>
      <Box sx={{ height: 500 }}>
        <DataGrid
          rows={formattedAppointments}
          columns={columns}
          pageSize={7}
          rowsPerPageOptions={[7]}
          disableSelectionOnClick
        />
      </Box>

      <Modal open={openModal} onClose={handleCloseModal}>
  <Box
    sx={{
      p: 4,
      width: 600,
      bgcolor: 'background.paper',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      borderRadius: 2,
    }}
  >
    <Typography variant="h6" mb={2}>
      {currentAppointment ? 'Edit Appointment' : 'Create Appointment'}
    </Typography>
    <Grid container spacing={2}>
      {!isNewClient && (
        <Grid item xs={12}>
          <Autocomplete
            value={selectedClient}
            onChange={(e, newVal) => setSelectedClient(newVal)}
            onInputChange={(e, inputVal) => setSearchQuery(inputVal)}
            options={searchResults}
            getOptionLabel={(option) =>
              `${option.first_name} ${option.last_name} (${option.email})`
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} label="Search or Select Client" fullWidth />
            )}
          />
        </Grid>
      )}

      <Grid item xs={12}>
        <Button
          variant="outlined"
          onClick={() => {
            setIsNewClient(!isNewClient);
            if (!isNewClient) {
              setSelectedClient(null);
            } else {
              setNewClientData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
              });
            }
          }}
        >
          {isNewClient ? 'Use Existing Client' : 'Create New Client'}
        </Button>
      </Grid>

      {isNewClient && (
        <>
          <Grid item xs={6}>
            <TextField
              label="First Name"
              fullWidth
              value={newClientData.first_name}
              onChange={(e) =>
                setNewClientData({ ...newClientData, first_name: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Last Name"
              fullWidth
              value={newClientData.last_name}
              onChange={(e) =>
                setNewClientData({ ...newClientData, last_name: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              fullWidth
              value={newClientData.email}
              onChange={(e) =>
                setNewClientData({ ...newClientData, email: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Phone"
              fullWidth
              value={newClientData.phone}
              onChange={(e) =>
                setNewClientData({ ...newClientData, phone: e.target.value })
              }
            />
          </Grid>
        </>
      )}

      <Grid item xs={12}>
        <FormControl fullWidth disabled={user?.role === 'employee'}>
          <InputLabel>Employee</InputLabel>
          <Select
            value={formData.employee}
            onChange={(e) =>
              setFormData({ ...formData, employee: e.target.value })
            }
          >
            {artists.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel>Service</InputLabel>
          <Select
            value={formData.service}
            onChange={(e) =>
              setFormData({ ...formData, service: e.target.value })
            }
          >
            {services.map((s) => (
              <MenuItem key={s.id} value={s.name}>
                {s.name_display}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6}>
        <TextField
          label="Price"
          type="number"
          fullWidth
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: e.target.value })
          }
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Date"
          type="date"
          fullWidth
          value={formData.date}
          onChange={(e) =>
            setFormData({ ...formData, date: e.target.value })
          }
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Start Time"
          type="time"
          fullWidth
          value={formData.startTime}
          onChange={(e) =>
            setFormData({ ...formData, startTime: e.target.value })
          }
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="End Time"
          type="time"
          fullWidth
          value={formData.endTime}
          onChange={(e) =>
            setFormData({ ...formData, endTime: e.target.value })
          }
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Notes"
          multiline
          rows={2}
          fullWidth
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
        />
      </Grid>

      <Grid item xs={12}>
        <Button fullWidth variant="contained" onClick={handleSave}>
          {currentAppointment ? 'Save Changes' : 'Create'}
        </Button>
      </Grid>

      {currentAppointment && (
        <>
          <Grid item xs={6}>
            <Button
              fullWidth
              color="success"
              onClick={() =>
                handleStatusChange(currentAppointment.id, 'completed')
              }
            >
              Completed
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              color="error"
              onClick={() =>
                handleStatusChange(currentAppointment.id, 'no_show')
              }
            >
              No Show
            </Button>
          </Grid>
        </>
      )}
    </Grid>
  </Box>
</Modal>
    </Box>
  );
};

export default AppointmentsPage;
