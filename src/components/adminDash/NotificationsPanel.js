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

const serviceMap = {
  service_1: "Service 1",
  service_2: "Service 2",
  service_3: "Service 3",
};

const formatTime = (hhmmss) => {
  if (!hhmmss || typeof hhmmss !== "string") return hhmmss;
  const date = new Date(`1970-01-01T${hhmmss}`);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr; // fallback if it's not a real date
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

const normalize = (field, value) => {
  if (!value) return "";
  if (field === "service") return serviceMap[value] || value;
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
  const client = notification.appointment_details.client;
  const artist = notification.appointment_details.artist;
  const serviceValues = getFieldValues(notification, "service");
  const priceValues = getFieldValues(notification, "price");
  const dateValues = getFieldValues(notification, "date");
  const notesValues = getFieldValues(notification, "notes");
  const timeValues = getTimeValues(notification);

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
                      : notification.action === "no_show"
                        ? "No Show"
                        : "Updated Appointment"}
                  </TableCell>
                  <TableCell>{new Date(notification.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={notification.status.toUpperCase()} color={getStatusColor(notification.status)} />
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
