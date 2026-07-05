import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AccessDeniedPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h4" component="h1" sx={{ color: 'error.main' }} gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }} gutterBottom>
        You don't have permission to view this page.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
        Go to my dashboard
      </Button>
    </Box>
  );
};

export default AccessDeniedPage;
