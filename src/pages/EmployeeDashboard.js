import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import UpcomingAppointments from '../components/employeeDash/UpcomingAppointments';

const EmployeeDashboard = () => {
    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Employee Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* Upcoming Appointments - Now using the new component */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Upcoming Appointments
                        </Typography>
                        <UpcomingAppointments />
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
