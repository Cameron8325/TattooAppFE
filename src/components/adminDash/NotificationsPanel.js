import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../services/axios";

// Updated deduplication: for each appointment, if there’s any pending notification, use that;
// otherwise, use the most recent notification.
const deduplicateNotifications = (notifications) => {
  const grouped = {};
  notifications.forEach((notif) => {
    const key = notif.appointment && notif.appointment.id ? notif.appointment.id : notif.id;
    if (!grouped[key]) {
      grouped[key] = notif;
    } else {
      if (grouped[key].status !== "pending" && notif.status === "pending") {
        grouped[key] = notif;
      } else if (new Date(notif.timestamp) > new Date(grouped[key].timestamp)) {
        grouped[key] = notif;
      }
    }
  });
  return Object.values(grouped);
};

// Helper to render an employee's name (prefer full_name, then username)
const getEmployeeName = (employee) => {
  if (employee && typeof employee === "object") {
    return employee.full_name || employee.username || `Employee #${employee.id || ""}`;
  }
  return `Employee #${employee}`;
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
  return { previous, current };
};

/**
 * Returns time values (combining start and end times) for previous and current states.
 */
const getTimeValues = (notification) => {
  const prevStart = notification.previous_details && notification.previous_details.time
    ? notification.previous_details.time
    : notification.appointment_details.time;
  const prevEnd = notification.previous_details && notification.previous_details.end_time
    ? notification.previous_details.end_time
    : notification.appointment_details.end_time;
  const currentStart = notification.changes && notification.changes.time && notification.changes.time.new
    ? notification.changes.time.new
    : notification.appointment_details.time;
  const currentEnd = notification.changes && notification.changes.end_time && notification.changes.end_time.new
    ? notification.changes.end_time.new
    : notification.appointment_details.end_time;

  return {
    previous: `${prevStart} - ${prevEnd}`,
    current: `${currentStart} - ${currentEnd}`,
  };
};

/**
 * Renders a single table that displays the appointment details with two columns:
 * one for the previous (last confirmed) value and one for the new (requested) value.
 * Changed fields are highlighted.
 */
const renderDiffTable = (notification) => {
  // For fields that don't change in our flow, we simply display the same values.
  // We assume that client and artist fields don't change with update requests.
  const client = notification.appointment_details.client;
  const artist = notification.appointment_details.artist;

  const serviceValues = getFieldValues(notification, "service");
  const priceValues = getFieldValues(notification, "price");
  const dateValues = getFieldValues(notification, "date");
  const notesValues = getFieldValues(notification, "notes");
  const timeValues = getTimeValues(notification);

  // Array of rows. Each row is an object with label, previous, current.
  const rows = [
    { label: "Client", previous: client, current: client },
    { label: "Artist", previous: artist, current: artist },
    { label: "Service", previous: serviceValues.previous, current: serviceValues.current },
    { label: "Price", previous: `$${priceValues.previous}`, current: `$${priceValues.current}` },
    { label: "Date", previous: dateValues.previous, current: dateValues.current },
    { label: "Time", previous: timeValues.previous, current: timeValues.current },
    { label: "Notes", previous: notesValues.previous, current: notesValues.current },
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
            <TableRow key={row.label} sx={{ backgroundColor: isChanged ? "#ffebee" : "inherit" }}>
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

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/recent-activity/");
      const deduped = deduplicateNotifications(data);
      setNotifications(deduped);
    } catch (err) {
      console.error("Error fetching notifications:", err);
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
      fetchNotifications();
      setSelectedNotification(null);
    } catch (err) {
      console.error("Error approving notification:", err);
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.post(`/recent-activity/${id}/decline/`);
      fetchNotifications();
      setSelectedNotification(null);
    } catch (err) {
      console.error("Error declining notification:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/recent-activity/${id}/delete/`);
      fetchNotifications();
      setSelectedNotification(null);
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "denied":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Notifications
      </Typography>
      {notifications.length === 0 ? (
        <Typography>No notifications available.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Manage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>{getEmployeeName(notification.employee)}</TableCell>
                  <TableCell>
                    {notification.action === "created"
                      ? "Created Appointment"
                      : "Updated Appointment"}
                  </TableCell>
                  <TableCell>{new Date(notification.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={notification.status.toUpperCase()}
                      color={getStatusColor(notification.status)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => setSelectedNotification(notification)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
            >
              <DeleteIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Employee:</strong> {selectedNotification.employee_name || getEmployeeName(selectedNotification.employee)}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Action:</strong>{" "}
              {selectedNotification.action === "created"
                ? "Created Appointment"
                : "Updated Appointment"}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Timestamp:</strong> {new Date(selectedNotification.timestamp).toLocaleString()}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Status:</strong> {selectedNotification.status.toUpperCase()}
            </Typography>

            {/* Render the combined diff table with Previous and New values */}
            {selectedNotification.appointment_details && renderDiffTable(selectedNotification)}
          </DialogContent>
          <DialogActions>
            {selectedNotification.status === "pending" && (
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
