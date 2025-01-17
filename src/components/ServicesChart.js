import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import axios from '../services/axios.js';

const ServicesChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get('/services/stats/')
            .then((response) => setData(response.data))
            .catch((error) => {
                console.error('Error fetching service data:', error);
                setData([
                    { service: 'Tattoo', bookings: 10 },
                    { service: 'Piercing', bookings: 6 },
                    { service: 'Consultation', bookings: 14 },
                ]);
            });
    }, []);
    

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#ff5722" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ServicesChart;
