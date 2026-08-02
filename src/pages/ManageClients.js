import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import axios, { getErrorMessage } from '../services/axios';
import { AuthContext } from '../context/authContext';
import PageContainer from '../components/layout/PageContainer';

const EMPTY_CLIENT = { first_name: '', last_name: '', email: '', phone: '', employee: '' };

const ManageClients = () => {
  const { user } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_CLIENT);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchClients = useCallback(async () => {
    try {
      const { data } = await axios.get('/clients/');
      setClients(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    fetchClients();
    if (user.role === 'admin') {
      axios.get('/users/?role=employee').then(({ data }) => setEmployees(data)).catch(() => {});
    } else {
      setEmployees([user]);
    }
  }, [fetchClients, user]);

  const filteredClients = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return clients;
    return clients.filter((client) =>
      [client.first_name, client.last_name, client.email, client.phone].join(' ').toLowerCase().includes(needle)
    );
  }, [clients, query]);

  const openCreate = () => {
    setEditing({ id: null });
    setForm({ ...EMPTY_CLIENT, employee: user.role === 'employee' ? user.id : '' });
  };

  const openEdit = (client) => {
    setEditing(client);
    setForm({ ...client });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (editing.id) {
        await axios.patch(`/clients/${editing.id}/`, form);
        setSuccess('Client details updated.');
      } else {
        await axios.post('/clients/', form);
        setSuccess('Client added to the studio.');
      }
      setEditing(null);
      fetchClients();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Delete ${client.first_name} ${client.last_name}? Their appointments will also be removed.`)) return;
    try {
      await axios.delete(`/clients/${client.id}/`);
      setSuccess('Client removed.');
      fetchClients();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <PageContainer
      eyebrow="Records"
      title="Clients"
      subtitle="Contact details and artist assignments for everyone your studio serves."
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add client</Button>}
    >
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(0); }}
            placeholder="Search clients"
            aria-label="Search clients"
            sx={{ width: { xs: '100%', sm: 340 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto', display: { xs: 'none', sm: 'block' } }}>{filteredClients.length} clients</Typography>
        </Box>
        <TableContainer>
          <Table size="small" aria-label="Client directory">
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Assigned artist</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((client) => {
                const employee = employees.find((item) => item.id === client.employee);
                const fullName = `${client.first_name} ${client.last_name}`;
                return (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.bg', color: 'secondary.main', fontSize: 12, fontWeight: 800 }}>{client.first_name[0]}{client.last_name[0]}</Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{fullName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell>{client.employee_name || employee?.full_name || employee?.username || 'Unassigned'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit client"><IconButton aria-label={`Edit ${fullName}`} size="small" onClick={() => openEdit(client)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete client"><IconButton aria-label={`Delete ${fullName}`} size="small" color="error" onClick={() => handleDelete(client)}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!filteredClients.length && (
                <TableRow><TableCell colSpan={5}>
                  <Stack alignItems="center" spacing={1} sx={{ py: 6, color: 'text.secondary' }}><PeopleAltOutlinedIcon /><Typography variant="body2">No clients match this search.</Typography></Stack>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredClients.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleSave}>
          <DialogTitle>{editing?.id ? 'Edit client' : 'Add client'}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField label="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
              <TextField label="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
              <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required sx={{ gridColumn: { sm: 'span 2' } }} />
              <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} sx={{ gridColumn: { sm: 'span 2' } }} />
              <TextField select label="Assigned artist" value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} disabled={user.role === 'employee'} required sx={{ gridColumn: { sm: 'span 2' } }}>
                {employees.map((employee) => <MenuItem key={employee.id} value={employee.id}>{employee.full_name || employee.username}</MenuItem>)}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions><Button onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" variant="contained">{editing?.id ? 'Save changes' : 'Add client'}</Button></DialogActions>
        </Box>
      </Dialog>
    </PageContainer>
  );
};

export default ManageClients;
