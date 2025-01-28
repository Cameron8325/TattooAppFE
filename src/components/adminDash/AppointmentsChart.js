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
import axios from '../../services/axios.js';

const AppointmentsChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get('/appointments/stats/')
            .then((response) => setData(response.data))
            .catch((error) => {
                console.error('Error fetching chart data:', error);
                // Fallback mock data
                setData([
                    { date: '2025-01-01', appointments: 5 },
                    { date: '2025-01-02', appointments: 8 },
                    { date: '2025-01-03', appointments: 4 },
                ]);
            });
    }, []);
    

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="appointments" stroke="#1976d2" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default AppointmentsChart;
