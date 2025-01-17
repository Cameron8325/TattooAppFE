import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import AppointmentsChart from '../components/AppointmentsChart';
import ServicesChart from '../components/ServicesChart';
import ArtistPerformanceChart from '../components/ArtistPerformanceChart';

const AdminDashboard = () => {
    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* Appointment Trends */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Appointment Trends
                        </Typography>
                        <AppointmentsChart />
                    </Paper>
                </Grid>

                {/* Popular Services */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Popular Services
                        </Typography>
                        <ServicesChart />
                    </Paper>
                </Grid>

                {/* Artist Performance */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ padding: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Artist Performance
                        </Typography>
                        <ArtistPerformanceChart />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
