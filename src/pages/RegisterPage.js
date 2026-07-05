import React, { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box, Alert, Paper } from "@mui/material";
import { register } from "../services/authService";
import { AuthContext } from "../context/authContext";
import { getErrorMessage } from "../services/axios";

const EMPTY_FORM = { username: "", email: "", password: "" };

const RegisterPage = () => {
  const { user, loading } = useContext(AuthContext);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Admin-only page: backend enforces IsAdmin on register/; the UI
  // mirrors that rule rather than exposing a dead form.
  if (loading) return null;
  if (!user || user.role !== "admin") {
    return <Navigate to="/access-denied" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await register(form);
      setSuccess(`Account "${form.username}" created.`);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: 6, p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register New User
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Admin only — creates an employee account.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            helperText="Minimum 8 characters."
            required
          />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Create Account
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
