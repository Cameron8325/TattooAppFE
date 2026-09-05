import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Alert, Typography } from '@mui/material';
import axios from '../../services/axios';

const ArtistPerformanceChart = ({ refreshVersion = 0 }) => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(false);
    axios.get('/artists/performance/').then(({ data: response }) => current && setData(response))
      .catch(() => current && setError(true)).finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [refreshVersion]);

  if (error) return <Alert severity="error">Artist workload could not be loaded.</Alert>;
  if (loading) return <Typography>Loading artist workload…</Typography>;
  if (data.length === 0) return <Typography>No artist bookings in this period.</Typography>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
        <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="artist" width={82} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: theme.palette.neutral.bg }} />
        <Bar dataKey="appointments" fill={theme.palette.secondary.main} radius={[0, 3, 3, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ArtistPerformanceChart;
