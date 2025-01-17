import React, { useEffect, useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import axios from '../services/axios.js';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ArtistPerformanceChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get('/artists/performance/')
            .then((response) => setData(response.data))
            .catch((error) => {
                console.error('Error fetching artist performance:', error);
                setData([
                    { artist: 'Artist A', appointments: 20 },
                    { artist: 'Artist B', appointments: 15 },
                    { artist: 'Artist C', appointments: 10 },
                ]);
            });
    }, []);
    

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="appointments"
                    nameKey="artist"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default ArtistPerformanceChart;
