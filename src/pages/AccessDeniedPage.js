import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from "react-router-dom";


const AccessDeniedPage = () => {
    const navigate = useNavigate();
    
    const handleGoBack = () => {
        navigate('/'); // ✅ Fix navigation
    };
    
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                textAlign: 'center',
                padding: 3,
            }}
        >
            <Typography variant="h3" color="error" gutterBottom>
                Access Denied
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
                You don't have permission to view this page.
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={handleGoBack}
                sx={{ marginTop: 2 }}
            >
                Go Back
            </Button>
        </Box>
    );
};

export default AccessDeniedPage;
