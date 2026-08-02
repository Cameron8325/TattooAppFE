import React, { useContext, useState } from 'react';
import { Alert, Box, Button, MenuItem, Stack, TextField } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { register } from '../services/authService';
import { AuthContext } from '../context/authContext';
import { getErrorMessage } from '../services/axios';
import PageContainer from '../components/layout/PageContainer';
import Section from '../components/layout/Section';

const EMPTY_FORM = { username: '', first_name: '', last_name: '', email: '', role: 'employee', password: '' };

const RegisterPage = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/access-denied" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/user-management', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <PageContainer
      eyebrow="Studio"
      title="Add team member"
      subtitle="Create login credentials and assign studio access."
      maxWidth="md"
      actions={<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/user-management')}>Back to team</Button>}
    >
      <Section>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField label="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
            <TextField label="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
            <TextField label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <TextField select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <MenuItem value="employee">Artist / employee</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
            </TextField>
            <TextField label="Temporary password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} helperText="Minimum 8 characters" required />
          </Box>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}><Button type="submit" variant="contained">Create account</Button></Stack>
        </Box>
      </Section>
    </PageContainer>
  );
};

export default RegisterPage;
