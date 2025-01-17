import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import AppointmentsChart from '../components/AppointmentsChart';
import ServicesChart from '../components/ServicesChart';
import ArtistPerformanceChart from '../components/ArtistPerformanceChart';

const AdminDashboard = () => {
    return (
        <Grid container spacing={3} padding={3}>
            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                    Admin Dashboard
                </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
                <Paper elevation={3} style={{ padding: 16 }}>
                    <Typography variant="h6" gutterBottom>
                        Appointment Trends
                    </Typography>
                    <AppointmentsChart />
                </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
                <Paper elevation={3} style={{ padding: 16 }}>
                    <Typography variant="h6" gutterBottom>
                        Popular Services
                    </Typography>
                    <ServicesChart />
                </Paper>
            </Grid>

            <Grid item xs={12}>
                <Paper elevation={3} style={{ padding: 16 }}>
                    <Typography variant="h6" gutterBottom>
                        Artist Performance
                    </Typography>
                    <ArtistPerformanceChart />
                </Paper>
            </Grid>
        </Grid>
    );
};

export default AdminDashboard;
