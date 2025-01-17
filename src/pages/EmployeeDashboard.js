import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, List, ListItem, ListItemText } from '@mui/material';
import axios from '../services/axios';

const EmployeeDashboard = () => {
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        axios.get('/appointments/upcoming/')
            .then((response) => setAppointments(response.data))
            .catch(() => {
                // Mock data fallback
                setAppointments([
                    { id: 1, client: 'John Doe', service: 'Tattoo', date: '2025-01-15', time: '10:00 AM' },
                    { id: 2, client: 'Jane Smith', service: 'Piercing', date: '2025-01-15', time: '1:00 PM' },
                ]);
            });
    }, []);
    

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Employee Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* Upcoming Appointments */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Upcoming Appointments
                        </Typography>
                        {appointments.length > 0 ? (
                            <List>
                                {appointments.map((appointment) => (
                                    <ListItem key={appointment.id}>
                                        <ListItemText
                                            primary={`${appointment.client} - ${appointment.service}`}
                                            secondary={`${appointment.date} at ${appointment.time}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography>No upcoming appointments.</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Task Reminders (Optional Section) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Task Reminders
                        </Typography>
                        <Typography>
                            No reminders for now. Check back later!
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EmployeeDashboard;
