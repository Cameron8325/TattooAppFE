import React, { useEffect, useState } from 'react';
import { Alert, Box, Skeleton, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import axios from '../../services/axios';

const STAT_LABELS = [
  { key: 'total', label: 'Total' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'canceled', label: 'Canceled' },
  { key: 'no_show', label: 'No-show' },
];

const AppointmentOverview = () => {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(false);

  useEffect(() => {
    const params = filter === 'all' ? '' : `?filter=${filter}`;
    setData(null);
    setError(false);
    axios.get(`/appointments/overview/${params}`).then(({ data: response }) => setData(response)).catch(() => setError(true));
  }, [filter]);

  return (
    <Box>
      {error && <Alert severity="error">Appointment totals could not be loaded.</Alert>}
      <ToggleButtonGroup exclusive size="small" value={filter} onChange={(_, value) => value && setFilter(value)} aria-label="Appointment period" sx={{ mb: 2.5 }}>
        <ToggleButton value="all">All time</ToggleButton>
        <ToggleButton value="today">Today</ToggleButton>
        <ToggleButton value="this_week">This week</ToggleButton>
      </ToggleButtonGroup>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        {STAT_LABELS.map(({ key, label }, index) => (
          <Box key={key} sx={{ p: 2, borderRight: index < STAT_LABELS.length - 1 ? 1 : 0, borderBottom: { xs: index < 3 ? 1 : 0, sm: 0 }, borderColor: 'divider', bgcolor: key === 'pending' ? 'warning.bg' : 'background.paper' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>{label}</Typography>
            {data ? <Typography variant="h5" sx={{ mt: 0.5 }}>{data[key] ?? 0}</Typography> : error ? <Typography>—</Typography> : <Skeleton width={42} height={30} />}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AppointmentOverview;
