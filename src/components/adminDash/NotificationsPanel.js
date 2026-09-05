import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  IconButton,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../services/axios";
import { getErrorMessage } from "../../services/axios";
import { formatTime, formatDate } from "../../utils/dateTime";
import { SERVICE_LABELS } from "../../constants";

// Updated deduplication: for each appointment, if there’s any pending notification, use that;
// otherwise, use the most recent notification.
const deduplicateNotifications = (notifications) => {
  const grouped = {};
  notifications.forEach((notif) => {
    const key = notif.appointment_id ? `appointment:${notif.appointment_id}` : `notice:${notif.id}`;
    if (!grouped[key]) {
      grouped[key] = notif;
    } else {
      if (grouped[key].status !== "pending" && notif.status === "pending") {
        grouped[key] = notif;
      } else if (grouped[key].status === notif.status && new Date(notif.timestamp) > new Date(grouped[key].timestamp)) {
        grouped[key] = notif;
      }
    }
  });
  return Object.values(grouped).sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') || new Date(b.timestamp) - new Date(a.timestamp));
};

// Helper to render an employee's name (prefer full_name, then username)
const getEmployeeName = (employee) => {
  if (employee && typeof employee === "object") {
    return employee.full_name || employee.username || `Employee #${employee.id || ""}`;
  }
  return `Employee #${employee}`;
};

const normalize = (field, value) => {
  if (value === null || value === undefined) return "";
  if (field === 'deposit_required' || field === 'deposit_paid') return value ? 'Yes' : 'No';
  if (field === "service") return SERVICE_LABELS[value] || value;
  if (field === "time" || field === "end_time") return formatTime(value);
  if (field === "date") return formatDate(value);
  return value;
};



/**
 * Returns an object with previous and current values for a given field.
 * For non-time fields.
 */
const getFieldValues = (notification, field) => {
  let previous = "";
  let current = "";

  if (notification.previous_details && notification.previous_details[field] !== undefined) {
    previous = notification.previous_details[field];
  } else if (notification.appointment_details && notification.appointment_details[field] !== undefined) {
    previous = notification.appointment_details[field];
  }

  if (notification.changes && notification.changes[field] && notification.changes[field].new !== undefined) {
    current = notification.changes[field].new;
  } else if (notification.appointment_details && notification.appointment_details[field] !== undefined) {
    current = notification.appointment_details[field];
  }

  return {
    previous: normalize(field, previous),
    current: normalize(field, current),
  };
};


/**
 * Returns time values (combining start and end times) for previous and current states.
 */
const isRawTime = (val) => typeof val === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(val);

const safeFormat = (field, val) => isRawTime(val) ? normalize(field, val) : val;

const getTimeValues = (notification) => {
  const prevStart = safeFormat("time",
    (notification.previous_details?.time) || notification.appointment_details.time
  );
  const prevEnd = safeFormat("end_time",
    (notification.previous_details?.end_time) || notification.appointment_details.end_time
  );

  const currentStart = safeFormat("time",
    (notification.changes?.time?.new) || notification.appointment_details.time
  );
  const currentEnd = safeFormat("end_time",
    (notification.changes?.end_time?.new) || notification.appointment_details.end_time
  );

  return {
    previous: `${prevStart} - ${prevEnd}`,
    current: `${currentStart} - ${currentEnd}`,
  };
};


/**
 * Renders a table displaying appointment details with previous and new values.
 */
const renderDiffTable = (notification) => {
  const client = getFieldValues(notification, 'client');
  const artist = getFieldValues(notification, 'artist');
  const serviceValues = getFieldValues(notification, "service");
  const priceValues = getFieldValues(notification, "price");
  const dateValues = getFieldValues(notification, "date");
  const notesValues = getFieldValues(notification, "notes");
  const timeValues = getTimeValues(notification);

  const rows = [
    { label: "Client", previous: client.previous, current: client.current },
    { label: "Artist", previous: artist.previous, current: artist.current },
    { label: "Service", previous: serviceValues.previous, current: serviceValues.current },
    { label: "Price", previous: `$${priceValues.previous}`, current: `$${priceValues.current}` },
    { label: "Date", previous: dateValues.previous, current: dateValues.current },
    { label: "Time", previous: timeValues.previous, current: timeValues.current },
    { label: "Notes", previous: notesValues.previous, current: notesValues.current },
    ...['deposit_required', 'deposit_paid', 'deposit_amount'].map(field => ({
      label: {deposit_required:'Deposit required', deposit_paid:'Deposit paid', deposit_amount:'Deposit amount'}[field],
      ...getFieldValues(notification, field),
    })),
  ];

  return (
    <Table sx={{ mt: 2 }}>
      <TableHead>
        <TableRow>
          <TableCell><strong>Field</strong></TableCell>
          <TableCell><strong>Previous</strong></TableCell>
          <TableCell><strong>New</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => {
          const isChanged = row.previous !== row.current;
          return (
            <TableRow key={row.label} sx={{ backgroundColor: isChanged ? "error.bg" : "inherit" }}>
              <TableCell>{row.label}</TableCell>
              <TableCell>{row.previous}</TableCell>
              <TableCell>{row.current}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const NotificationsPanel = ({ onAppointmentChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get("/recent-activity/");
      const deduped = deduplicateNotifications(data);
      setNotifications(deduped);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError('The approval queue could not be loaded. Refresh the page to try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.post(`/recent-activity/${id}/approve/`);
      onAppointmentChange?.();
      fetchNotifications();
      setSelectedNotification(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.post(`/recent-activity/${id}/decline/`);
      onAppointmentChange?.();
      fetchNotifications();
      setSelectedNotification(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reviewed activity entry? The booking will be kept.')) return;
    try {
      await axios.delete(`/recent-activity/${id}/delete/`);
      fetchNotifications();
      setSelectedNotification(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Tinted chip styling per status (AA pairs from the theme palette).
  const statusChipSx = {
    pending: { backgroundColor: "warning.bg", color: "warning.text" },
    approved: { backgroundColor: "success.bg", color: "success.text" },
    denied: { backgroundColor: "error.bg", color: "error.text" },
  };

  const actionLabel = (action) =>
    action === "created"
      ? "Created appointment"
      : action === "no_show"
        ? "Marked no-show"
        : "Updated appointment";

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {notifications.length === 0 && !error ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          No recent activity.
        </Typography>
      ) : (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, maxHeight: 580, overflowY: "auto" }}>
          {notifications.map((notification) => (
            <Box
              component="li"
              key={notification.id}
              role="button"
              tabIndex={0}
              aria-label={`View details: ${actionLabel(notification.action)} by ${notification.employee_name || getEmployeeName(notification.employee)}`}
              onClick={() => setSelectedNotification(notification)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedNotification(notification);
                }
              }}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 2,
                py: 2,
                px: 1.5,
                mx: 0,
                borderRadius: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
                transition: "background-color 0.2s ease-in-out",
                "&:hover, &:focus-visible": { backgroundColor: "primary.bg" },
                "&:last-of-type": { borderBottom: "none" },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {actionLabel(notification.action)}
                </Typography>
                <Typography variant="caption" component="p" sx={{ color: "text.secondary", mt: 0.25 }}>
                  {notification.employee_name || getEmployeeName(notification.employee)}
                  {" · "}
                  {new Date(notification.timestamp).toLocaleString()}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={notification.status}
                sx={{ textTransform: "capitalize", flexShrink: 0, ...statusChipSx[notification.status] }}
              />
            </Box>
          ))}
        </Box>
      )}
      {selectedNotification && (
        <Dialog open onClose={() => setSelectedNotification(null)} maxWidth="md" fullWidth>
          <DialogTitle>
            Notification Details
            <IconButton
              onClick={() => handleDelete(selectedNotification.id)}
              color="error"
              size="small"
              sx={{ float: "right" }}
              title="Delete Notification"
              disabled={selectedNotification.status === 'pending'}
            >
              <DeleteIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Typography variant="subtitle1" gutterBottom>
              <strong>Employee:</strong> {selectedNotification.employee_name || getEmployeeName(selectedNotification.employee)}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Action:</strong>{" "}
              {selectedNotification.action === "created"
                ? "Created Appointment"
                : selectedNotification.action === "no_show"
                  ? "No Show"
                  : "Updated Appointment"}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Timestamp:</strong> {new Date(selectedNotification.timestamp).toLocaleString()}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Status:</strong> {selectedNotification.status.toUpperCase()}
            </Typography>
            {selectedNotification.appointment_details && renderDiffTable(selectedNotification)}
          </DialogContent>
          <DialogActions>
            {/* Only show Approve/Decline buttons if NOT a no_show notification */}
            {selectedNotification.action !== "no_show" && selectedNotification.status === "pending" && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => handleApprove(selectedNotification.id)}
                  sx={{ mr: 1 }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleDecline(selectedNotification.id)}
                >
                  Decline & Revert
                </Button>
              </>
            )}
            <Button onClick={() => setSelectedNotification(null)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default NotificationsPanel;
