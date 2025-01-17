import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import axios from '../services/axios';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('/auth/login/', { email, password });
            const token = response.data.token;
            localStorage.setItem('token', token); // Store the token
            history.push('/appointments'); // Redirect to appointments page
        } catch (err) {
            setError('Invalid email or password. Please try again.');
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
                Login
            </Typography>
            {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
            <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: 400 }}>
                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    required
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    required
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
                    Login
                </Button>
            </form>
        </Box>
    );
};

export default LoginPage;
