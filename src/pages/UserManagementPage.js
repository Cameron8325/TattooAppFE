// Repaired against the real API (old version called nonexistent
// /users/employees/ endpoints): list GET /users/, edit PATCH /users/<id>/,
// delete DELETE /users/<id>/. Account creation goes through the admin-only
// /register flow rather than a second, divergent form.
import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios, { getErrorMessage } from '../services/axios';
import PageContainer from '../components/layout/PageContainer';
import { ROLE_LABELS } from '../constants';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null); // user being edited
  const [error, setError] = useState('');

  const fetchUsers = useCallback(() => {
    axios.get('/users/')
      .then((res) => setUsers(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    axios.patch(`/users/${editing.id}/`, {
      username: formData.get('username'),
      email: formData.get('email'),
    })
      .then(() => {
        setEditing(null);
        fetchUsers();
      })
      .catch((err) => setError(getErrorMessage(err)));
  };

  const handleDelete = (user) => {
    if (!window.confirm(`Delete account "${user.username}"? This cannot be undone.`)) return;
    axios.delete(`/users/${user.id}/`)
      .then(fetchUsers)
      .catch((err) => setError(getErrorMessage(err)));
  };

  return (
    <PageContainer title="User Management">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Stack direction="row" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => navigate('/register')}>
          Add User
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small" aria-label="User accounts">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.full_name || '—'}</TableCell>
                <TableCell>{user.email || '—'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={ROLE_LABELS[user.role] || user.role}
                    sx={
                      user.role === 'admin'
                        ? { backgroundColor: 'primary.bg', color: 'primary.main' }
                        : { backgroundColor: 'neutral.bg', color: 'neutral.text' }
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => setEditing(user)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(user)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
                    No users found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="xs">
        <DialogTitle>Edit User</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <TextField
              name="username"
              label="Username"
              fullWidth
              defaultValue={editing?.username || ''}
              margin="normal"
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              defaultValue={editing?.email || ''}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageContainer>
  );
};

export default UserManagementPage;
