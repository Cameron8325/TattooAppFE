import React, { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box, Alert, Paper } from "@mui/material";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(credentials);
      if (response) {
        if (response.role === "employee") {
          navigate("/employee-dashboard");
        } else if (response.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/access-denied");
        }
      }
    } catch (err) {
      setError("Invalid username or password.");
    }
  };

  return (
    <Container maxWidth="sm">
      {/* Paper inherits the bordered-flat variant from the theme */}
      <Paper sx={{ mt: 6, p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            autoComplete="username"
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            autoComplete="current-password"
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </Box>

        {/* Registration is admin-only: no self-service link. */}
        <Typography variant="caption" component="p" sx={{ mt: 2, color: "text.secondary" }}>
          Accounts are provisioned by your administrator.
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoginPage;
