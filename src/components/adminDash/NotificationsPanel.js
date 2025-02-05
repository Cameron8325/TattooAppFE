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
} from "@mui/material";
import axios from "../../services/axios"; // or your path

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // GET /recent-activity/
      const { data } = await axios.get("/recent-activity/");
      /*
        data = [
          {
            "id": 1,
            "employee": <employee_id or object>,
            "action": "created"|"updated"|"pending_approval",
            "timestamp": "...",
            "status": "pending"|"approved"|"denied"
          },
          ...
        ]
      */
      setNotifications(data);
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
      await axios.post(`/approve-notification/${id}/`);
      alert("Notification approved!");
      // Remove from list or refetch
      fetchNotifications();
    } catch (err) {
      console.error("Error approving notification:", err);
      alert("Error approving notification.");
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.post(`/decline-notification/${id}/`);
      alert("Notification declined!");
      fetchNotifications();
    } catch (err) {
      console.error("Error declining notification:", err);
      alert("Error declining notification.");
    }
  };

  if (loading) {
    return <Typography>Loading notifications...</Typography>;
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
                <TableCell>Manage</TableCell>
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
                    {notification.status === "pending" && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleApprove(notification.id)}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDecline(notification.id)}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {notification.status !== "pending" && (
                      <Typography>{notification.status.toUpperCase()}</Typography>
                    )}
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
