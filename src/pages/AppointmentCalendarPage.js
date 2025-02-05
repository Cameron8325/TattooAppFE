import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";

import axios from "../services/axios";
import { getUser } from "../services/authService";

// We use moment for the localizer
const localizer = momentLocalizer(moment);

const AppointmentCalendarPage = () => {
  // -------------------------------------------------
  // State
  // -------------------------------------------------
  const [currentUser, setCurrentUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [artists, setArtists] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);

  // For the create/edit modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); // if editing
  const [formData, setFormData] = useState({
    client: "",
    artist: "",
    service: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  // -------------------------------------------------
  // Fetch current user
  // -------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getUser();
        setCurrentUser(data); // e.g. { id, username, role }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    })();
  }, []);

  // -------------------------------------------------
  // Fetch appointments
  // -------------------------------------------------
  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get("/appointments/");
      /*
        "data" is an array of appointments:
        {
          id,
          client: {...} or null,
          artist: {...} or null,
          service,
          date: "YYYY-MM-DD",
          time: "HH:mm:ss",
          status: "pending"|"confirmed"|"canceled"...
          notes,
          requires_approval
        }
      */
      const events = data.map((appt) => {
        const start = moment(`${appt.date}T${appt.time}`).toDate();
        // +1 hour for demonstration or you can do a real "end_time" if you store it
        const end = moment(start).add(1, "hour").toDate();

        return {
          id: appt.id,
          title: `${appt.client?.first_name ?? "Unknown"} (${appt.status})`,
          start,
          end,
          status: appt.status,
          extendedAppt: appt, // store entire object
        };
      });
      setAppointments(events);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  // -------------------------------------------------
  // Fetch dropdown data for client, artist, services
  // -------------------------------------------------
  const fetchDropdownData = async () => {
    try {
      // For example:
      // /users/?role=employee => all artists
      // /clientprofiles/ => all clients
      // /services/
      const [artistsRes, clientsRes, servicesRes] = await Promise.all([
        axios.get("/users/?role=employee"), // or your endpoint for "employees/artists"
        axios.get("/clients"),       // or wherever you get a list of all clients
        axios.get("/services/"),
      ]);

      setArtists(artistsRes.data);
      setClients(clientsRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  // -------------------------------------------------
  // Load data on mount
  // -------------------------------------------------
  useEffect(() => {
    fetchAppointments();
    fetchDropdownData();
  }, []);

  // -------------------------------------------------
  // Big Calendar Handlers
  // -------------------------------------------------
  // Called when selecting an empty slot => create new
  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent(null);

    setFormData({
      client: "",
      artist: currentUser?.role === "admin" ? "" : currentUser?.id || "", // If employee, auto-assign themselves
      service: "",
      date: moment(start).format("YYYY-MM-DD"),
      startTime: moment(start).format("HH:mm"),
      endTime: moment(end).format("HH:mm"),
      notes: "",
    });
    setOpenModal(true);
  };

  // Called when selecting an existing event => edit
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    const appt = event.extendedAppt;

    setFormData({
      client: appt.client?.id || "",
      artist: appt.artist?.id || "",
      service: appt.service || "",
      date: appt.date,
      startTime: appt.time.slice(0, 5), // "HH:mm"
      endTime: moment(`${appt.date}T${appt.time}`)
        .add(1, "hour")
        .format("HH:mm"), // demonstration
      notes: appt.notes || "",
    });
    setOpenModal(true);
  };

  // Color-code event
  const eventPropGetter = (event) => {
    let backgroundColor = "#9e9e9e"; // default grey
    if (event.status === "confirmed") backgroundColor = "#4caf50";
    if (event.status === "pending") backgroundColor = "#ffc107";
    if (event.status === "canceled") backgroundColor = "#f44336";
    return { style: { backgroundColor } };
  };

  // -------------------------------------------------
  // Modal Logic
  // -------------------------------------------------
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEvent(null);
  };

  const handleSaveAppointment = async () => {
    // Basic validation
    if (!formData.client || !formData.artist || !formData.service) {
      alert("Client, Artist, and Service are required.");
      return;
    }
    // If employee, ensure formData.artist == their ID unless admin
    if (currentUser?.role === "employee" && formData.artist !== currentUser?.id.toString()) {
      alert("Employees can only create/edit their own appointments.");
      return;
    }

    // Combine date+time
    const dateStr = formData.date; // "YYYY-MM-DD"
    const timeStr = formData.startTime + ":00"; // "HH:mm:ss"

    // If editing existing event
    if (selectedEvent) {
      try {
        await axios.patch(`/appointments/${selectedEvent.id}/`, {
          client_id: formData.client,
          artist_id: formData.artist,
          service: formData.service,
          date: dateStr,
          time: timeStr,
          notes: formData.notes,
        });
        alert("Appointment updated!");
      } catch (err) {
        console.error("Error updating appointment:", err);
        if (err.response?.data?.error) {
          alert(err.response.data.error);
        } else {
          alert("Error updating appointment. Check console for details.");
        }
      }
    } else {
      // Creating new
      const status = currentUser?.role === "admin" ? "confirmed" : "pending";
      try {
        await axios.post("/appointments/", {
          client_id: formData.client,
          artist_id: formData.artist,
          service: formData.service,
          date: dateStr,
          time: timeStr,
          status,
          notes: formData.notes,
        });
        alert("Appointment created!");
      } catch (err) {
        console.error("Error creating appointment:", err);
        if (err.response?.data?.error) {
          alert(err.response.data.error);
        } else {
          alert("Error creating appointment. Check console for details.");
        }
      }
    }

    // Refresh
    handleCloseModal();
    fetchAppointments();
  };


  function FormatsAgendaTimeRangeFormats() {
    function getMinTime() {
      const min = new Date();
      min.setHours(8, 0, 0, 0);
      return min;
    }

    function getMaxTime() {
      const max = new Date();
      max.setHours(18, 0, 0, 0);
      return max;
    }
    return { min: getMinTime(), max: getMaxTime() };
  }

  const timeFormats = FormatsAgendaTimeRangeFormats();


  // -------------------------------------------------
  // Render
  // -------------------------------------------------
  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Appointment Calendar
      </Typography>

      <Calendar
        localizer={localizer}
        events={appointments}
        min={timeFormats.min}
        max={timeFormats.max}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventPropGetter}
        views={["month", "week", "day"]}
        defaultView="week"
        style={{ height: 800 }}
      />

      {/* CREATE/EDIT Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEvent ? "Edit Appointment" : "Create Appointment"}
        </DialogTitle>
        <DialogContent>
          {/* client, artist, service -> dropdowns */}
          <Box display="flex" gap={2} mb={2}>
            <FormControl fullWidth>
              <InputLabel id="client-select-label">Client</InputLabel>
              <Select
                labelId="client-select-label"
                label="Client"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              >
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={currentUser?.role === "employee"}>
              <InputLabel id="artist-select-label">Artist</InputLabel>
              <Select
                labelId="artist-select-label"
                label="Artist"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              >
                {artists.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel id="service-select-label">Service</InputLabel>
            <Select
              labelId="service-select-label"
              label="Service"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            >
              {services.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} — ${s.price}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" gap={2} my={2}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <TextField
              label="Start Time"
              type="time"
              fullWidth
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <TextField
              label="End Time"
              type="time"
              fullWidth
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </Box>

          <TextField
            label="Notes"
            multiline
            rows={2}
            fullWidth
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveAppointment} color="primary">
            {selectedEvent ? "Save Changes" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentCalendarPage;
