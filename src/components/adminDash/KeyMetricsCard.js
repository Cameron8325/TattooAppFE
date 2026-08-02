import React, { useEffect, useMemo, useState } from 'react';
import { Box, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import StatCard from '../layout/StatCard';
import axios from '../../services/axios';

const metricMeta = {
  total_revenue: { label: 'Revenue', icon: <AttachMoneyOutlinedIcon />, tone: 'primary', format: (value) => `$${Number(value || 0).toLocaleString()}` },
  total_appointments: { label: 'Completed sessions', icon: <EventAvailableOutlinedIcon />, tone: 'secondary', format: (value) => Number(value || 0).toLocaleString() },
  clients_served: { label: 'Clients served', icon: <PeopleAltOutlinedIcon />, tone: 'info', format: (value) => Number(value || 0).toLocaleString() },
};

const KeyMetrics = () => {
  const [metrics, setMetrics] = useState({});
  const [range, setRange] = useState('last_30_days');
  const [month, setMonth] = useState('');

  useEffect(() => {
    const params = month ? `month=${month}` : `range=${range}`;
    axios.get(`/metrics/?${params}`).then(({ data }) => setMetrics(data)).catch(() => setMetrics({}));
  }, [month, range]);

  const periodLabel = useMemo(() => month ? 'Selected month' : range === 'last_7_days' ? 'Last 7 days' : 'Last 30 days', [month, range]);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <ToggleButtonGroup exclusive size="small" value={month ? null : range} onChange={(_, value) => { if (value) { setRange(value); setMonth(''); } }} aria-label="Metric range">
          <ToggleButton value="last_7_days">7 days</ToggleButton>
          <ToggleButton value="last_30_days">30 days</ToggleButton>
        </ToggleButtonGroup>
        <TextField type="month" label="Month" InputLabelProps={{ shrink: true }} value={month} onChange={(event) => setMonth(event.target.value)} sx={{ width: 170 }} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
        {Object.entries(metricMeta).map(([key, meta]) => (
          <StatCard key={key} label={meta.label} value={meta.format(metrics[key])} helper={periodLabel} icon={meta.icon} tone={meta.tone} />
        ))}
      </Box>
    </Box>
  );
};

export default KeyMetrics;
