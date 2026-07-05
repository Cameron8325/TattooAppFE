import React, { useEffect, useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import axios from '../../services/axios'
import { chartPalette } from '../../theme';

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
                    fill={chartPalette[0]}
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartPalette[index % chartPalette.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default ArtistPerformanceChart;
