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
  Grid,
} from "@mui/material";

// 1) Import Autocomplete
import Autocomplete from "@mui/material/Autocomplete";

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
  const [services, setServices] = useState([]);

  // For the create/edit modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); // if editing

  // Appointment form fields (excluding the client logic)
  const [formData, setFormData] = useState({
    artist: "",
    service: "",
    price: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  // -------------------------------------
  // Client search-related states
  // -------------------------------------
  // For searching existing clients
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Whether we are creating a new client
  const [isNewClient, setIsNewClient] = useState(false);

  // If picking an existing client, store the selected client object here
  const [selectedClient, setSelectedClient] = useState(null);

  // If creating a new client, store their data here
  const [newClientData, setNewClientData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
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
          status: "pending"|"confirmed"|"canceled"...,
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
          extendedAppt: appt, // store the entire object
        };
      });
      setAppointments(events);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  // -------------------------------------------------
  // Fetch dropdown data for artists, services
  // -------------------------------------------------
  const fetchDropdownData = async () => {
    try {
      console.log("🔄 Fetching dropdown data...");
      const [artistsRes, servicesRes] = await Promise.allSettled([
        axios.get("/users/?role=employee").catch(() => ({ data: [] })), // Fetch artists (employees)
        axios.get("/services/").catch(() => ({ data: [] })), // Fetch services
      ]);

      // Set artists state only if the response contains a valid array
      setArtists(Array.isArray(artistsRes.value?.data) ? artistsRes.value.data : []);

      // Set services state only if the response contains a valid array
      setServices(Array.isArray(servicesRes.value?.data) ? servicesRes.value.data : []);

    } catch (err) {
      console.error("Error in fetchDropdownData:", err);
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
      artist: currentUser?.role === "admin" ? "" : currentUser?.id || "",
      service: "",
      date: moment(start).format("YYYY-MM-DD"),
      startTime: moment(start).format("HH:mm"),
      endTime: moment(end).format("HH:mm"),
      notes: "",
    });

    // Reset client states for a brand-new appointment
    setIsNewClient(false);
    setSelectedClient(null);
    setNewClientData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    });

    setOpenModal(true);
  };

  // Called when selecting an existing event => edit
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    const appt = event.extendedAppt;

    // If we have an existing client, place it in selectedClient
    setIsNewClient(false);
    setSelectedClient(appt.client || null);

    setFormData({
      artist: appt.artist?.id || "",
      service: appt.service || "",
      price: appt.price || "",
      date: appt.date,
      startTime: appt.time.slice(0, 5), // "HH:mm"
      endTime: moment(`${appt.date}T${appt.time}`)
        .add(1, "hour")
        .format("HH:mm"), // demonstration
      notes: appt.notes || "",
    });

    // Clear out newClientData
    setNewClientData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
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
  // Search for existing clients as user types
  // -------------------------------------------------
  useEffect(() => {
    if (searchQuery.length >= 2) {
      axios
        .get(`/clients/?search=${encodeURIComponent(searchQuery)}`)
        .then((res) => {
          setSearchResults(res.data); // array of matching client objects
        })
        .catch((err) => {
          console.error("Error searching clients:", err);
          setSearchResults([]);
        });
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // -------------------------------------------------
  // Modal Logic
  // -------------------------------------------------
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEvent(null);
  };

  const handleSaveAppointment = async () => {
    // Basic validation
    if (!isNewClient && !selectedClient) {
      alert("Please select an existing client or create a new client.");
      return;
    }
    if (!formData.artist || !formData.service) {
      alert("Artist and Service are required.");
      return;
    }

    // If employee, ensure they can only create/edit their own appointments
    if (
      currentUser?.role === "employee" &&
      formData.artist !== currentUser?.id.toString()
    ) {
      alert("Employees can only create/edit their own appointments.");
      return;
    }

    const dateStr = formData.date;
    const timeStr = formData.startTime + ":00";
    const status = currentUser?.role === "admin" ? "confirmed" : "pending";

    // Prepare the data to send
    const payload = {
      client_id: isNewClient ? undefined : selectedClient?.id,
      new_client: isNewClient ? newClientData : undefined,
      artist_id: formData.artist,
      service: formData.service,
      price: formData.price,
      date: dateStr,
      time: timeStr,
      notes: formData.notes,
      status,
    };

    try {
      if (selectedEvent) {
        // Updating an existing appointment
        await axios.patch(`/appointments/${selectedEvent.id}/`, payload);
        alert("Appointment updated!");
      } else {
        // Creating a new appointment
        await axios.post("/appointments/", payload);
        alert("Appointment created!");
      }
      handleCloseModal();
      fetchAppointments();
    } catch (err) {
      console.error("Error saving appointment:", err);
      alert(err.response?.data?.error || "Error saving appointment.");
    }
  };

  // -------------------------------------------------
  // Time Range for the Calendar
  // -------------------------------------------------
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

      {/* CREATE/EDIT MODAL */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEvent ? "Edit Appointment" : "Create Appointment"}
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2}>
            {/* 1) Autocomplete or New Client Toggle */}
            {!isNewClient && (
              <Grid item xs={12}>
                <Autocomplete
                  value={selectedClient}
                  onChange={(event, newValue) => {
                    setSelectedClient(newValue);
                  }}
                  onInputChange={(event, newInputValue) => {
                    setSearchQuery(newInputValue);
                  }}
                  options={searchResults}
                  getOptionLabel={(option) =>
                    `${option.first_name} ${option.last_name} (${option.email})`
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search or Select Client"
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
            )}

            {/* Toggle Button */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsNewClient(!isNewClient);
                  if (!isNewClient) {
                    // If we are switching to "new client", clear out the old data
                    setSelectedClient(null);
                  } else {
                    // If switching back to existing, clear newClientData
                    setNewClientData({
                      first_name: "",
                      last_name: "",
                      email: "",
                      phone: "",
                    });
                  }
                }}
              >
                {isNewClient ? "Use Existing Client" : "Create New Client"}
              </Button>
            </Grid>

            {/* 2) New Client Fields (Only Shows When isNewClient = true) */}
            {isNewClient && (
              <>
                <Grid item xs={6}>
                  <TextField
                    label="First Name"
                    fullWidth
                    value={newClientData.first_name}
                    onChange={(e) =>
                      setNewClientData({
                        ...newClientData,
                        first_name: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    value={newClientData.last_name}
                    onChange={(e) =>
                      setNewClientData({
                        ...newClientData,
                        last_name: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    fullWidth
                    value={newClientData.email}
                    onChange={(e) =>
                      setNewClientData({
                        ...newClientData,
                        email: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Phone"
                    fullWidth
                    value={newClientData.phone}
                    onChange={(e) =>
                      setNewClientData({
                        ...newClientData,
                        phone: e.target.value,
                      })
                    }
                  />
                </Grid>
              </>
            )}

            {/* 3) Artist Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth disabled={currentUser?.role === "employee"}>
                <InputLabel>Artist</InputLabel>
                <Select
                  value={formData.artist}
                  onChange={(e) =>
                    setFormData({ ...formData, artist: e.target.value })
                  }
                >
                  {artists.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 4) Service Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Service</InputLabel>
                <Select
                  value={formData.service}
                  onChange={(e) => {
                    // Update service selection but keep custom price untouched
                    setFormData({ ...formData, service: e.target.value });
                  }}
                >
                  {services.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name_display}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Custom Price Field */}
            <Grid item xs={12} md={6} >
              <TextField
                label="Price"
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                inputProps={{ min: "0", step: "0.01" }} // Ensure valid price input
              />
            </Grid>


            {/* 5) Date & Time */}
            <Grid item xs={4}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="End Time"
                type="time"
                fullWidth
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </Grid>

            {/* 6) Notes */}
            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                rows={2}
                fullWidth
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </Grid>
          </Grid>
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
