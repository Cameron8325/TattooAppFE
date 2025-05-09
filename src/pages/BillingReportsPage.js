import React, { useState } from 'react';
import {
    Box, Typography, Paper, Grid, Button, TextField, MenuItem,
    Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from '../services/axios';

const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

const BillingReportsPage = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [feeType, setFeeType] = useState('flat');
    const [feeValue, setFeeValue] = useState(20);
    const [reportData, setReportData] = useState(null);

    const handleFetchReport = () => {
        const payload = { month, year, fee_type: feeType, fee_value: feeValue };
        axios.post('/billing/summary/', payload)
            .then((response) => setReportData(response.data))
            .catch((error) => {
                console.error('Error fetching report:', error);
                setReportData(null);
            });
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>Billing and Reports</Typography>

            <Paper sx={{ padding: 2, marginBottom: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            select fullWidth label="Month"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                        >
                            {months.map((m) => (
                                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth label="Year"
                            type="number"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            select fullWidth label="Fee Type"
                            value={feeType}
                            onChange={(e) => setFeeType(e.target.value)}
                        >
                            <MenuItem value="flat">Flat Fee</MenuItem>
                            <MenuItem value="percentage">Percentage</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth
                            label="Fee Value"
                            value={feeValue}
                            onChange={(e) => setFeeValue(e.target.value)}
                            helperText="Enter flat fee or percentage value"
                            inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
                        />

                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" onClick={handleFetchReport}>
                            Generate Report
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {reportData && (
                <Box>
                    <Paper sx={{ padding: 2, marginBottom: 2 }}>
                        <Typography variant="h6">Shop Summary</Typography>
                        <Typography>Total Revenue: ${reportData.shop_total_revenue.toFixed(2)}</Typography>
                        <Typography>Total Shop Earnings: ${reportData.shop_total_earnings.toFixed(2)}</Typography>
                        <Typography>Total Appointments: {reportData.shop_total_appointments}</Typography>
                    </Paper>

                    {reportData.report.map((employee, idx) => (
                        <Accordion key={idx}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>
                                    Employee ID: {employee.employee_id} - Total: ${employee.total_earned.toFixed(2)} - Appointments: {employee.total_appointments}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Client</TableCell>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Price</TableCell>
                                                <TableCell>Shop Cut</TableCell>
                                                <TableCell>Artist Cut</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {employee.appointments.map((appt, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{appt.client_name}</TableCell>
                                                    <TableCell>{appt.date}</TableCell>
                                                    <TableCell>${appt.price.toFixed(2)}</TableCell>
                                                    <TableCell>${appt.shop_cut.toFixed(2)}</TableCell>
                                                    <TableCell>${appt.artist_cut.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default BillingReportsPage;
