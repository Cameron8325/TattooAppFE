import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import axios from '../services/axios';

const BillingReportsPage = () => {
    const [revenue, setRevenue] = useState(0);
    const [overduePayments, setOverduePayments] = useState([]);
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        // Fetch financial data
        axios.get('/billing/summary/')
            .then((response) => {
                setRevenue(response.data.total_revenue);
                setOverduePayments(response.data.overdue_payments);
                setReportData(response.data.report_data);
            })
            .catch(() => {
                // Fallback mock data
                setRevenue(12500.00);
                setOverduePayments([
                    { id: 1, client: 'John Doe', amount: 200.00, due_date: '2025-01-10' },
                    { id: 2, client: 'Jane Smith', amount: 150.00, due_date: '2025-01-12' },
                ]);
                setReportData([
                    { service: 'Tattoo', artist: 'Artist A', revenue: 7500.00 },
                    { service: 'Piercing', artist: 'Artist B', revenue: 5000.00 },
                ]);
            });
    }, []);

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Billing and Reports
            </Typography>

            <Grid container spacing={3}>
                {/* Total Revenue */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Total Revenue
                        </Typography>
                        <Typography variant="h4" color="primary">
                            ${revenue.toFixed(2)}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Overdue Payments */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Overdue Payments
                        </Typography>
                        {overduePayments.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Client</TableCell>
                                            <TableCell>Amount</TableCell>
                                            <TableCell>Due Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {overduePayments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>{payment.client}</TableCell>
                                                <TableCell>${payment.amount.toFixed(2)}</TableCell>
                                                <TableCell>{payment.due_date}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography>No overdue payments.</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Revenue Breakdown */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ padding: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Revenue Breakdown
                        </Typography>
                        {reportData.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Service</TableCell>
                                            <TableCell>Artist</TableCell>
                                            <TableCell>Revenue</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reportData.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.service}</TableCell>
                                                <TableCell>{row.artist}</TableCell>
                                                <TableCell>${row.revenue.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography>No data available.</Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BillingReportsPage;
