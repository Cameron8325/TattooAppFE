import React, { useState, useEffect, useRef } from "react";
import Calendar from "@toast-ui/calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import axios from "../services/axios";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from "@mui/material";

const CalendarPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [newAppointment, setNewAppointment] = useState({ clientId: "", artistId: "", serviceId: "", notes: "" });

  const calendarRef = useRef(null);
  const calendarContainerRef = useRef(null); // 📌 Reference to the container div

  // 📌 Move fetchAppointments OUTSIDE of useEffect
  const fetchAppointments = async () => {
    try {
      const response = await axios.get("/appointments/");
      const events = response.data.map((appointment) => ({
        id: appointment.id.toString(),
        calendarId: "1", // Required by ToastUI
        title: `${appointment.client.first_name} ${appointment.client.last_name}`,
        category: "time",
        start: `${appointment.date}T${appointment.time}`,
        end: `${appointment.date}T${appointment.time}`,
        status: appointment.status,
      }));

      calendarRef.current?.clear();
      calendarRef.current?.createEvents(events);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    if (!calendarContainerRef.current) return;

    // Initialize Calendar
    calendarRef.current = new Calendar(calendarContainerRef.current, {
      defaultView: "month",
      useDetailPopup: true,
      useCreationPopup: false,
      taskView: false,
      template: {
        time: (schedule) => `${schedule.title}`,
      },
      usageStatistics: false,
    });

    fetchAppointments(); // ✅ Now fetchAppointments is accessible here!

    // 📌 Handle empty slot clicks (for creating appointments)
    calendarRef.current.on("selectDateTime", (event) => {
      setSelectedDateTime(event.start);
      setShowCreateModal(true);
    });

    return () => {
      calendarRef.current.destroy();
    };
  }, []);

  // ✅ Function to submit a new appointment
  const handleSubmitAppointment = async () => {
    if (!selectedDateTime || !newAppointment.clientId || !newAppointment.artistId || !newAppointment.serviceId) {
      alert("⚠️ Please fill in all required fields.");
      return;
    }

    const formattedDate = selectedDateTime.toISOString().split("T")[0];
    const formattedTime = selectedDateTime.toISOString().split("T")[1].substring(0, 8);

    try {
      await axios.post("/appointments/", {
        clientId: newAppointment.clientId,
        artistId: newAppointment.artistId,
        serviceId: newAppointment.serviceId,
        date: formattedDate,
        time: formattedTime,
        status: "pending",
        notes: newAppointment.notes,
      });

      alert("✅ Appointment created successfully!");
      setShowCreateModal(false);

      // 📌 Refresh events after creation
      fetchAppointments(); // ✅ Now fetchAppointments is available here!
    } catch (error) {
      console.error("❌ Error creating appointment:", error);
    }
  };

  return (
    <div>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>📅 Appointment Calendar</Typography>

      {/* 📌 The div where ToastUI Calendar is mounted */}
      <div ref={calendarContainerRef} style={{ height: "800px" }} />

      {/* ✅ Create Appointment Modal */}
      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <DialogTitle>📅 Create New Appointment</DialogTitle>
        <DialogContent>
          <TextField
            label="Client ID"
            fullWidth
            margin="normal"
            onChange={(e) => setNewAppointment({ ...newAppointment, clientId: e.target.value })}
            required
          />
          <TextField
            label="Artist ID"
            fullWidth
            margin="normal"
            onChange={(e) => setNewAppointment({ ...newAppointment, artistId: e.target.value })}
            required
          />
          <TextField
            label="Service ID"
            fullWidth
            margin="normal"
            onChange={(e) => setNewAppointment({ ...newAppointment, serviceId: e.target.value })}
            required
          />
          <TextField
            label="Notes (Optional)"
            fullWidth
            margin="normal"
            onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateModal(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSubmitAppointment} color="primary">Create Appointment</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
