import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, Paper, Grid, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel } from "@mui/material";
import axios from "../../services/axios";
import { getCSRFToken } from "../../services/authService";
import moment from "moment";

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("today");
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // ✅ Move fetchAppointments outside of useEffect and use useCallback
  const fetchAppointments = useCallback(async () => {
    try {
      const endpoint = filter === "today" ? "/appointments/?filter=today" : "/appointments/?filter=this_week";
      const { data } = await axios.get(endpoint);
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  }, [filter]); // ✅ Declare filter as a dependency

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]); // ✅ Now fetchAppointments is a valid dependency

  // Open Modal for Viewing Appointment Details
  const handleSelectAppointment = (appt) => {
    setSelectedAppointment(appt);
    setOpenModal(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAppointment(null);
  };

  // Handle Status Update for Completed or No Show
  const handleUpdateStatus = async (status) => {
    if (!selectedAppointment) return;
    try {
      await axios.patch(
        `/appointments/${selectedAppointment.id}/reschedule/`,
        { status },
        { headers: { "X-CSRFToken": await getCSRFToken() } }
      );

      alert(`Appointment marked as ${status.replace("_", " ")}`);
      fetchAppointments(); // ✅ Refresh data
      handleCloseModal();
    } catch (error) {
      console.error(`Error updating appointment to ${status}:`, error);
      alert("Error updating appointment status.");
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Upcoming Appointments
      </Typography>

      {/* Filter Dropdown */}
      <FormControl sx={{ minWidth: 150, mb: 2 }}>
        <InputLabel>Filter</InputLabel>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="this_week">This Week</MenuItem>
        </Select>
      </FormControl>

      {/* Appointments List */}
      <Grid container spacing={2}>
        {appointments.length === 0 ? (
          <Typography variant="body1">No upcoming appointments.</Typography>
        ) : (
          appointments.map((appt) => (
            <Grid item xs={12} key={appt.id}>
              <Paper
                elevation={3}
                sx={{ padding: 2, cursor: "pointer" }}
                onClick={() => handleSelectAppointment(appt)}
              >
                <Typography variant="h6">{appt.client.first_name} {appt.client.last_name}</Typography>
                <Typography variant="body2">Service: {appt.service}</Typography>
                <Typography variant="body2">Date: {moment(appt.date).format("MMMM D, YYYY")}</Typography>
                <Typography variant="body2">Time: {appt.time}</Typography>
                <Typography variant="body2">Status: {appt.status}</Typography>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      {/* Appointment Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <>
              <TextField label="Client" fullWidth value={`${selectedAppointment.client.first_name} ${selectedAppointment.client.last_name}`} disabled />
              <TextField label="Service" fullWidth value={selectedAppointment.service} disabled sx={{ mt: 2 }} />
              <TextField label="Date" fullWidth value={moment(selectedAppointment.date).format("YYYY-MM-DD")} disabled sx={{ mt: 2 }} />
              <TextField label="Time" fullWidth value={selectedAppointment.time} disabled sx={{ mt: 2 }} />
              <TextField label="Notes" fullWidth multiline rows={3} value={selectedAppointment.notes || "No notes"} disabled sx={{ mt: 2 }} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">Cancel</Button>
          <Button onClick={() => handleUpdateStatus("completed")} color="success">Completed</Button>
          <Button onClick={() => handleUpdateStatus("no_show")} color="error">No Show</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UpcomingAppointments;
