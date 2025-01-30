import React, { useState } from "react";
import { login, getUser } from "../services/authService";
import { useHistory } from "react-router-dom"; // ✅ Replacing useNavigate with useHistory
import { Container, TextField, Button, Typography, Box, Alert } from "@mui/material";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const history = useHistory(); // ✅ Replacing useNavigate with useHistory

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await login(credentials); // ✅ No need to handle tokens
        const user = await getUser(); // ✅ Fetch user from session
        if (user.data) {
            history.push("/dashboard"); // ✅ Redirect after successful login
        }
    } catch (error) {
        setError("Invalid username or password.");
    }
};


  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, p: 4, boxShadow: 3, borderRadius: 2, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Don't have an account? <a href="/register">Register</a>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;
