import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import axios, { getErrorMessage } from '../services/axios';
import PageContainer from '../components/layout/PageContainer';
import { ROLE_LABELS } from '../constants';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await axios.get('/users/');
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSave = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await axios.patch(`/users/${editing.id}/`, Object.fromEntries(form.entries()));
      setEditing(null);
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Delete ${account.username}'s account? This cannot be undone.`)) return;
    try {
      await axios.delete(`/users/${account.id}/`);
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <PageContainer
      eyebrow="Studio"
      title="Team"
      subtitle="Manage staff profiles, roles, and access to the studio workspace."
      actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/register')}>Add team member</Button>}
    >
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
        <Table size="small" aria-label="Team accounts">
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Username</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {users.map((account) => (
              <TableRow key={account.id} hover>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>{account.full_name || 'Name not set'}</Typography></TableCell>
                <TableCell>{account.username}</TableCell>
                <TableCell>{account.email || '-'}</TableCell>
                <TableCell><Chip size="small" label={ROLE_LABELS[account.role] || account.role} sx={account.role === 'admin' ? { bgcolor: 'primary.bg', color: 'primary.main' } : { bgcolor: 'secondary.bg', color: 'secondary.main' }} /></TableCell>
                <TableCell align="right">
                  <IconButton aria-label={`Edit ${account.username}`} size="small" onClick={() => setEditing(account)}><EditOutlinedIcon fontSize="small" /></IconButton>
                  <IconButton aria-label={`Delete ${account.username}`} size="small" color="error" onClick={() => handleDelete(account)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSave}>
          <DialogTitle>Edit team member</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: 1 }}>
              <TextField name="first_name" label="First name" defaultValue={editing?.first_name || ''} />
              <TextField name="last_name" label="Last name" defaultValue={editing?.last_name || ''} />
              <TextField name="username" label="Username" defaultValue={editing?.username || ''} required />
              <TextField name="email" label="Email" type="email" defaultValue={editing?.email || ''} />
              <TextField select name="role" label="Role" defaultValue={editing?.role || 'employee'} sx={{ gridColumn: { sm: 'span 2' } }}>
                <MenuItem value="employee">Artist / employee</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions><Button onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" variant="contained">Save changes</Button></DialogActions>
        </Box>
      </Dialog>
    </PageContainer>
  );
};

export default UserManagementPage;
