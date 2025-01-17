import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import axios from '../services/axios';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const history = useHistory();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            await axios.post('/auth/register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => history.push('/login'), 2000); // Redirect after success
        } catch (err) {
            setError('Error registering. Please try again.');
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: 3,
            }}
        >
            <Typography variant="h4" gutterBottom>
                Register
            </Typography>
            {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ marginBottom: 2 }}>{success}</Alert>}
            <form onSubmit={handleRegister} style={{ width: '100%', maxWidth: 400 }}>
                <TextField
                    label="Username"
                    name="username"
                    fullWidth
                    required
                    margin="normal"
                    value={formData.username}
                    onChange={handleInputChange}
                />
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    fullWidth
                    required
                    margin="normal"
                    value={formData.email}
                    onChange={handleInputChange}
                />
                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    fullWidth
                    required
                    margin="normal"
                    value={formData.password}
                    onChange={handleInputChange}
                />
                <TextField
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    fullWidth
                    required
                    margin="normal"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
                    Register
                </Button>
            </form>
        </Box>
    );
};

export default RegisterPage;
