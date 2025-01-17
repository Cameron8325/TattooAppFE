import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
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
} from '@mui/material';
import axios from '../services/axios';

const UserManagementPage = () => {
    const [employees, setEmployees] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null); // For edit

    useEffect(() => {
        axios.get('/users/employees/')
            .then((response) => setEmployees(response.data))
            .catch(() => {
                setEmployees([
                    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Artist' },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Manager' },
                ]);
            });
    }, []);
    

    const handleOpenDialog = (employee = null) => {
        setCurrentEmployee(employee);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setCurrentEmployee(null);
        setOpenDialog(false);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const employeeData = {
            name: formData.get('name'),
            email: formData.get('email'),
            role: formData.get('role'),
        };

        if (currentEmployee) {
            // Update employee
            axios.put(`/users/employees/${currentEmployee.id}/`, employeeData)
                .then(() => {
                    setEmployees((prev) =>
                        prev.map((emp) =>
                            emp.id === currentEmployee.id ? { ...emp, ...employeeData } : emp
                        )
                    );
                    handleCloseDialog();
                });
        } else {
            // Add new employee
            axios.post('/users/employees/', employeeData)
                .then((response) => {
                    setEmployees((prev) => [...prev, response.data]);
                    handleCloseDialog();
                });
        }
    };

    const handleDelete = (id) => {
        axios.delete(`/users/employees/${id}/`).then(() => {
            setEmployees((prev) => prev.filter((emp) => emp.id !== id));
        });
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                User Management
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDialog()}
                        sx={{ marginBottom: 2 }}
                    >
                        Add Employee
                    </Button>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {employees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell>{employee.id}</TableCell>
                                        <TableCell>{employee.name}</TableCell>
                                        <TableCell>{employee.email}</TableCell>
                                        <TableCell>{employee.role}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleOpenDialog(employee)}
                                                sx={{ marginRight: 1 }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => handleDelete(employee.id)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>

            {/* Dialog for Add/Edit */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {currentEmployee ? 'Edit Employee' : 'Add Employee'}
                </DialogTitle>
                <form onSubmit={handleFormSubmit}>
                    <DialogContent>
                        <TextField
                            name="name"
                            label="Name"
                            fullWidth
                            defaultValue={currentEmployee?.name || ''}
                            margin="normal"
                            required
                        />
                        <TextField
                            name="email"
                            label="Email"
                            type="email"
                            fullWidth
                            defaultValue={currentEmployee?.email || ''}
                            margin="normal"
                            required
                        />
                        <TextField
                            name="role"
                            label="Role"
                            fullWidth
                            defaultValue={currentEmployee?.role || ''}
                            margin="normal"
                            required
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="secondary">
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            {currentEmployee ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default UserManagementPage;
