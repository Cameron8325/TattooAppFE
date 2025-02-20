// src/components/adminDash/NotificationsPanel.js
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
      // If one notification is pending and the other isn’t, choose the pending one.
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

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/recent-activity/");
      // Group by appointment so that one notification per appointment is shown.
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
      // Refetch to show the updated notification status (approved)
      fetchNotifications();
      setSelectedNotification(null);
    } catch (err) {
      console.error("Error approving notification:", err);
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.post(`/recent-activity/${id}/decline/`);
      // Refetch so that the updated (denied) status is shown
      fetchNotifications();
      setSelectedNotification(null);
    } catch (err) {
      console.error("Error declining notification:", err);
    }
  };

  // Delete button appears only in the modal.
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

  const renderChangesTable = (changes, previousDetails) => {
    if (!previousDetails) return null;
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Field</TableCell>
            <TableCell>Previous</TableCell>
            <TableCell>New</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(previousDetails).map((key) => (
            <TableRow
              key={key}
              sx={{
                backgroundColor: changes && changes[key] ? "#ffebee" : "inherit",
              }}
            >
              <TableCell>{key}</TableCell>
              <TableCell>{previousDetails[key]}</TableCell>
              <TableCell>
                {changes && changes[key] ? changes[key].new : previousDetails[key]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
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
                  <TableCell>
                    {new Date(notification.timestamp).toLocaleString()}
                  </TableCell>
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
              <strong>Employee:</strong> {getEmployeeName(selectedNotification.employee)}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Action:</strong>{" "}
              {selectedNotification.action === "created"
                ? "Created Appointment"
                : "Updated Appointment"}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Timestamp:</strong>{" "}
              {new Date(selectedNotification.timestamp).toLocaleString()}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Status:</strong> {selectedNotification.status.toUpperCase()}
            </Typography>
            {selectedNotification.changes &&
              renderChangesTable(
                selectedNotification.changes,
                selectedNotification.previous_details
              )}
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
