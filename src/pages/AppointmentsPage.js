import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Modal, TextField, Typography } from '@mui/material';
import axios from '../services/axios.js';

const AppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [currentAppointment, setCurrentAppointment] = useState(null); // For edit

    useEffect(() => {
        axios.get('/appointments/')
            .then((response) => setAppointments(response.data))
            .catch((error) => console.error(error));
    }, []);

    const handleOpenModal = (appointment = null) => {
        setCurrentAppointment(appointment);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setCurrentAppointment(null);
        setOpenModal(false);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newAppointment = {
            client: formData.get('client'),
            artist: formData.get('artist'),
            service: formData.get('service'),
            date: formData.get('date'),
            time: formData.get('time'),
            status: formData.get('status'),
        };

        if (currentAppointment) {
            // Update existing appointment
            axios.put(`/appointments/${currentAppointment.id}/`, newAppointment)
                .then(() => {
                    setAppointments((prev) =>
                        prev.map((item) =>
                            item.id === currentAppointment.id ? { ...item, ...newAppointment } : item
                        )
                    );
                });
        } else {
            // Create new appointment
            axios.post('/appointments/', newAppointment)
                .then((response) => setAppointments((prev) => [...prev, response.data]));
        }

        handleCloseModal();
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'client', headerName: 'Client', width: 150 },
        { field: 'artist', headerName: 'Artist', width: 150 },
        { field: 'service', headerName: 'Service', width: 200 },
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'time', headerName: 'Time', width: 150 },
        { field: 'status', headerName: 'Status', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenModal(params.row)}
                        style={{ marginRight: 8 }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDelete(params.row.id)}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    const handleDelete = (id) => {
        axios.delete(`/appointments/${id}/`).then(() => {
            setAppointments((prev) => prev.filter((item) => item.id !== id));
        });
    };

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <Button variant="contained" color="primary" onClick={() => handleOpenModal()} style={{ marginBottom: 16 }}>
                Create Appointment
            </Button>
            <DataGrid rows={appointments} columns={columns} />

            {/* Modal for Create/Edit */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" marginBottom={2}>
                        {currentAppointment ? 'Edit Appointment' : 'Create Appointment'}
                    </Typography>
                    <form onSubmit={handleFormSubmit}>
                        <TextField
                            name="client"
                            label="Client"
                            fullWidth
                            defaultValue={currentAppointment?.client || ''}
                            margin="normal"
                        />
                        <TextField
                            name="artist"
                            label="Artist"
                            fullWidth
                            defaultValue={currentAppointment?.artist || ''}
                            margin="normal"
                        />
                        <TextField
                            name="service"
                            label="Service"
                            fullWidth
                            defaultValue={currentAppointment?.service || ''}
                            margin="normal"
                        />
                        <TextField
                            name="date"
                            label="Date"
                            type="date"
                            fullWidth
                            defaultValue={currentAppointment?.date || ''}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            name="time"
                            label="Time"
                            type="time"
                            fullWidth
                            defaultValue={currentAppointment?.time || ''}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            name="status"
                            label="Status"
                            fullWidth
                            defaultValue={currentAppointment?.status || ''}
                            margin="normal"
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            {currentAppointment ? 'Update' : 'Create'}
                        </Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
};

export default AppointmentsPage;
