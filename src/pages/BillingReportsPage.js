import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import axios, { getErrorMessage } from '../services/axios';
import PageContainer from '../components/layout/PageContainer';
import Section from '../components/layout/Section';
import StatCard from '../components/layout/StatCard';
import { MONTHS } from '../constants';
import { formatDate } from '../utils/dateTime';

const money = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const defaultReportDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);

const BillingReportsPage = () => {
  const [month, setMonth] = useState(defaultReportDate.getMonth() + 1);
  const [year, setYear] = useState(defaultReportDate.getFullYear());
  const [feeType, setFeeType] = useState('flat');
  const [feeValue, setFeeValue] = useState(20);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/billing/summary/', { month, year, fee_type: feeType, fee_value: feeValue });
      setReportData(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer eyebrow="Studio" title="Billing" subtitle="Calculate studio fees and artist payouts from completed appointments.">
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      <Section title="Report settings" subtitle="Choose a period and the studio fee arrangement" sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, minmax(130px, 1fr))' }, gap: 2, alignItems: 'start' }}>
          <TextField select label="Month" value={month} onChange={(event) => setMonth(Number(event.target.value))}>{MONTHS.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}</TextField>
          <TextField label="Year" type="number" value={year} onChange={(event) => setYear(Number(event.target.value))} />
          <TextField select label="Studio fee" value={feeType} onChange={(event) => setFeeType(event.target.value)}><MenuItem value="flat">Flat per appointment</MenuItem><MenuItem value="percentage">Percentage of price</MenuItem></TextField>
          <TextField label={feeType === 'flat' ? 'Fee amount ($)' : 'Fee percentage (%)'} type="number" value={feeValue} onChange={(event) => setFeeValue(event.target.value)} inputProps={{ min: 0, step: '0.01' }} />
          <Button variant="contained" startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />} onClick={generateReport} disabled={loading} sx={{ height: 40 }}>Generate report</Button>
        </Box>
      </Section>

      {reportData ? (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2.5 }}>
            <StatCard label="Gross revenue" value={money(reportData.shop_total_revenue)} icon={<AttachMoneyOutlinedIcon />} tone="primary" />
            <StatCard label="Studio earnings" value={money(reportData.shop_total_earnings)} icon={<StorefrontOutlinedIcon />} tone="secondary" />
            <StatCard label="Completed sessions" value={reportData.shop_total_appointments} icon={<EventAvailableOutlinedIcon />} tone="info" />
          </Box>

          <Typography variant="h6" sx={{ mb: 1.5 }}>Artist payouts</Typography>
          <Stack spacing={1.25}>
            {reportData.report.map((employee) => (
              <Accordion key={employee.employee_id} disableGutters sx={{ border: 1, borderColor: 'divider', '&::before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.5fr repeat(3, 1fr)' }, gap: 2, alignItems: 'center', pr: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>{employee.employee_name || `Artist ${employee.employee_id}`}</Typography>
                    <Box><Typography variant="caption" sx={{ color: 'text.secondary' }}>Gross</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{money(employee.total_earned)}</Typography></Box>
                    <Box><Typography variant="caption" sx={{ color: 'text.secondary' }}>Studio fee</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{money(employee.shop_fee)}</Typography></Box>
                    <Box><Typography variant="caption" sx={{ color: 'text.secondary' }}>Net payout</Typography><Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>{money(employee.net_payout)}</Typography></Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer component={Paper} square>
                    <Table size="small"><TableHead><TableRow><TableCell>Client</TableCell><TableCell>Date</TableCell><TableCell align="right">Price</TableCell><TableCell align="right">Studio</TableCell><TableCell align="right">Artist</TableCell></TableRow></TableHead>
                      <TableBody>{employee.appointments.map((appointment, index) => <TableRow key={`${appointment.date}-${index}`}><TableCell>{appointment.client_name}</TableCell><TableCell>{formatDate(appointment.date)}</TableCell><TableCell align="right">{money(appointment.price)}</TableCell><TableCell align="right">{money(appointment.shop_cut)}</TableCell><TableCell align="right">{money(appointment.artist_cut)}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
            {!reportData.report.length && <Paper sx={{ border: 1, borderColor: 'divider', p: 5, textAlign: 'center' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>No completed appointments in this period.</Typography></Paper>}
          </Stack>
        </>
      ) : (
        <Paper sx={{ border: 1, borderStyle: 'dashed', borderColor: 'divider', p: 6, textAlign: 'center' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>Set the fee terms, then generate a payout report.</Typography></Paper>
      )}
    </PageContainer>
  );
};

export default BillingReportsPage;
