import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";
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
import { getCSRFToken } from "../services/authService";


// We use moment for the localizer
const localizer = momentLocalizer(moment);

const AppointmentCalendarPage = () => {
  // -------------------------------------------------
  // State
  // -------------------------------------------------
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [artists, setArtists] = useState([]);
  const [services, setServices] = useState([]);

  // For the create/edit modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); // if editing

  // Appointment form fields (excluding the client logic)
  const [formData, setFormData] = useState({
    employee: "",
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
  // Fetch appointments
  // -------------------------------------------------



  const fetchAppointments = async () => {
    try {
        const { data } = await axios.get("/appointments/");

        const events = data.map((appt) => {
            const start = moment(`${appt.date}T${appt.time}`).toDate();
            const end = appt.end_time
                ? moment(`${appt.date}T${appt.end_time}`).toDate()  // ✅ Use actual end_time
                : moment(start).add(1, "hour").toDate();  // Fallback for older records

            return {
                id: appt.id,
                title: `${appt.client?.first_name ?? "Unknown"} (${appt.status})`,
                start,
                end,
                status: appt.status,
                extendedAppt: appt,
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
        axios.get("/users/?role=employee").catch(() => ({ data: [] })),
        axios.get("/services/").catch(() => ({ data: [] })),
      ]);

      setArtists(Array.isArray(artistsRes.value?.data) ? artistsRes.value.data : []);
      setServices(Array.isArray(servicesRes.value?.data) ? servicesRes.value.data : []);

      console.log("🔍 Services Data:", servicesRes.value?.data);
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
      employee: user?.role === "admin" ? "" : user?.id || "",
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
    console.log("Selected Appointment Data:", event.extendedAppt); // Debugging

    setSelectedEvent(event);
    const appt = event.extendedAppt;

    setIsNewClient(false);
    setSelectedClient(appt.client || null);

    setFormData({
        employee: appt.employee || "",  
        service: appt.service,  
        price: appt.price || "",
        date: appt.date,
        startTime: appt.time.slice(0, 5),
        endTime: appt.end_time ? appt.end_time.slice(0, 5) : moment(`${appt.date}T${appt.time}`).add(1, "hour").format("HH:mm"),  // ✅ Use actual end_time if available
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
    console.log("🚀 Form Data Before Submission:", formData);

    const isAdmin = user?.role === "admin";

    let requestData = {
        employee: formData.employee,
        service: formData.service,
        price: formData.price,
        date: formData.date,
        time: formData.startTime + ":00",
        end_time: formData.endTime + ":00",  // ✅ Ensure end_time is sent
        notes: formData.notes,
        status: isAdmin ? "confirmed" : "pending",
        requires_approval: !isAdmin
    };

    if (isNewClient) {
        if (!newClientData.first_name || !newClientData.last_name || !newClientData.email) {
            alert("Error: New client information is incomplete.");
            return;
        }
        requestData.new_client = {
            first_name: newClientData.first_name,
            last_name: newClientData.last_name,
            email: newClientData.email,
            phone: newClientData.phone,
            employee: formData.employee
        };
    } else {
        const clientId = selectedClient?.id ?? selectedEvent?.extendedAppt?.client?.id;
        if (!clientId) {
            alert("Error: Client information is missing. Please select a client.");
            return;
        }
        requestData.client_id = clientId;
    }

    console.log("📨 Sending Request Data:", requestData);

    try {
        let response;
        
        if (selectedEvent) {
            if (isAdmin) {
                requestData.status = "confirmed";
                requestData.requires_approval = false;
            }

            response = await axios.patch(
                `/appointments/${selectedEvent.id}/reschedule/`, 
                requestData, 
                { headers: { "X-CSRFToken": await getCSRFToken() } }
            );

            console.log("✅ Appointment Updated:", response.data);
            alert("Appointment rescheduled successfully.");

            // ✅ Ensure the event updates in state correctly
            setAppointments((prevAppointments) =>
                prevAppointments.map((appt) =>
                    appt.id === selectedEvent.id
                        ? {
                            ...appt,
                            start: moment(`${response.data.date}T${response.data.time}`).toDate(),
                            end: moment(`${response.data.date}T${response.data.end_time}`).toDate(),  // ✅ Use correct end_time from response
                            status: response.data.status,
                            extendedAppt: response.data
                        }
                        : appt
                )
            );

        } else {
            response = await axios.post(
                "/appointments/",
                requestData,
                { headers: { "X-CSRFToken": await getCSRFToken() } }
            );

            console.log("✅ Appointment Created:", response.data);
            alert(isAdmin ? "Appointment confirmed!" : "Appointment requested and pending approval.");

            setAppointments((prevAppointments) => [
                ...prevAppointments,
                {
                    id: response.data.id,
                    title: `${response.data.client?.first_name ?? "Unknown"} (${response.data.status})`,
                    start: moment(`${response.data.date}T${response.data.time}`).toDate(),
                    end: moment(`${response.data.date}T${response.data.end_time}`).toDate(),  // ✅ Ensure correct end_time
                    status: response.data.status,
                    extendedAppt: response.data
                }
            ]);
        }

        handleCloseModal();
    } catch (err) {
        console.error("❌ Error saving appointment:", err);
        console.error("Full error response:", err.response?.data);
        alert(JSON.stringify(err.response?.data, null, 2) || "Error saving appointment.");
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
              <FormControl fullWidth disabled={user?.role === "employee"}>
                <InputLabel>Employee</InputLabel>  {/* ✅ Update label */}
                <Select
                  value={formData.employee || ""}  // ✅ Ensure correct state field is used
                  onChange={(e) => setFormData({ ...formData, employee: e.target.value })}  // ✅ Set "employee", not "artist"
                >
                  {artists.map((a) => (  // ❌ Rename "artists" to "employees" if backend has changed
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
                  value={formData.service || ""}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                >
                  {services.map((s) => (
                    <MenuItem key={s.id} value={s.name}>
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
                value={String(formData.price)}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </Grid>


            {/* 5) Date & Time */}
            <Grid item xs={4}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={formData.date || moment().format("YYYY-MM-DD")}
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
                value={formData.startTime || "00:00"}
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
                value={formData.endTime || "00:00"}  // ✅ Ensure valid fallback
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
