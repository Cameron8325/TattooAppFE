import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Alert, Typography } from '@mui/material';
import axios from '../../services/axios.js';

const AppointmentsChart = ({ refreshVersion = 0 }) => {
    const theme = useTheme();
    const [data, setData] = useState([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let current = true;
        setLoading(true);
        setError(false);
        axios.get('/appointments/stats/')
            .then((response) => current && setData(response.data))
            .catch(() => current && setError(true))
            .finally(() => current && setLoading(false));
        return () => { current = false; };
    }, [refreshVersion]);
    
    if (error) return <Alert severity="error">Booking trend could not be loaded.</Alert>;
    if (loading) return <Typography>Loading booking trend…</Typography>;
    if (data.length === 0) return <Typography>No bookings in this period.</Typography>;
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="appointments" stroke={theme.palette.primary.main} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default AppointmentsChart;
