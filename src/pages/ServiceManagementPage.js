import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import DesignServicesOutlinedIcon from '@mui/icons-material/DesignServicesOutlined';
import axios, { getErrorMessage } from '../services/axios';
import PageContainer from '../components/layout/PageContainer';
import { SERVICE_DESCRIPTIONS } from '../constants';

const ServiceManagementPage = () => {
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchServices = useCallback(async () => {
    try {
      const { data } = await axios.get('/services/');
      setServices(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? services.filter((service) => `${service.name_display} ${service.description}`.toLowerCase().includes(needle)) : services;
  }, [query, services]);

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      await axios.patch(`/services/${editing.id}/`, { name: editing.name, description: editing.description, price: editing.price });
      setEditing(null);
      setSuccess('Service menu updated.');
      fetchServices();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <PageContainer eyebrow="Studio" title="Services" subtitle="Keep the booking menu and baseline pricing accurate for your team.">
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}
      <Paper sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services" aria-label="Search services" sx={{ width: { xs: '100%', sm: 320 } }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
        </Box>
        <TableContainer>
          <Table size="small" aria-label="Service menu">
            <TableHead><TableRow><TableCell>Service</TableCell><TableCell>Description</TableCell><TableCell align="right">Starting price</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
            <TableBody>
              {filtered.map((service, index) => (
                <TableRow key={service.id} hover>
                  <TableCell><Stack direction="row" spacing={1.25} alignItems="center"><Box sx={{ width: 32, height: 32, display: 'grid', placeItems: 'center', bgcolor: index % 2 ? 'secondary.bg' : 'primary.bg', color: index % 2 ? 'secondary.main' : 'primary.main', borderRadius: 1 }}><DesignServicesOutlinedIcon fontSize="small" /></Box><Typography variant="body2" sx={{ fontWeight: 700 }}>{service.name_display}</Typography></Stack></TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{service.description || SERVICE_DESCRIPTIONS[service.name] || '-'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>${Number(service.price).toFixed(2)}</TableCell>
                  <TableCell align="right"><IconButton aria-label={`Edit ${service.name_display}`} size="small" onClick={() => setEditing({ ...service })}><EditOutlinedIcon fontSize="small" /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handleSave}>
          <DialogTitle>Edit service</DialogTitle>
          <DialogContent dividers><Stack spacing={2} sx={{ pt: 1 }}><TextField label="Service" value={editing?.name_display || ''} disabled /><TextField label="Description" multiline minRows={3} value={editing?.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /><TextField label="Starting price" type="number" value={editing?.price || ''} onChange={(e) => setEditing({ ...editing, price: e.target.value })} inputProps={{ min: 0, step: '0.01' }} required /></Stack></DialogContent>
          <DialogActions><Button onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" variant="contained">Save service</Button></DialogActions>
        </Box>
      </Dialog>
    </PageContainer>
  );
};

export default ServiceManagementPage;
