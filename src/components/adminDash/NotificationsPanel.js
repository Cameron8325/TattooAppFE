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
} from "@mui/material";

const mockNotifications = [
  {
    id: 1,
    employee: "John Doe",
    action: "Requested schedule change",
    timestamp: "2025-01-28T10:00:00Z",
    status: "pending",
  },
  {
    id: 2,
    employee: "Jane Smith",
    action: "Canceled appointment",
    timestamp: "2025-01-28T09:30:00Z",
    status: "approved",
  },
  {
    id: 3,
    employee: "Sam Wilson",
    action: "Updated service details",
    timestamp: "2025-01-27T16:45:00Z",
    status: "denied",
  },
];

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setTimeout(() => {
        setNotifications(mockNotifications); // Simulating API call
        setLoading(false);
      }, 1000);
    };
    fetchNotifications();
  }, []);

  const handleAction = (id, action) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    console.log(`Notification with ID ${id} ${action} successfully.`);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>{notification.employee}</TableCell>
                  <TableCell>{notification.action}</TableCell>
                  <TableCell>
                    {new Date(notification.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{notification.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleAction(notification.id, "approve")}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleAction(notification.id, "decline")}
                    >
                      Decline
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default NotificationsPanel;
