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
import Autocomplete from "@mui/material/Autocomplete";
import axios from "../services/axios";
import { getCSRFToken } from "../services/authService";

const localizer = momentLocalizer(moment);

const AppointmentCalendarPage = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [artists, setArtists] = useState([]);
  const [services, setServices] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [formData, setFormData] = useState({
    employee: "",
    service: "",
    price: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isNewClient, setIsNewClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClientData, setNewClientData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get("/appointments/");
      const events = data.map((appt) => {
        const start = moment(`${appt.date}T${appt.time}`).toDate();
        const end = appt.end_time
          ? moment(`${appt.date}T${appt.end_time}`).toDate()
          : moment(start).add(1, "hour").toDate();
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

  const fetchDropdownData = async () => {
    try {
      const [artistsRes, servicesRes] = await Promise.allSettled([
        axios.get("/users/?role=employee").catch(() => ({ data: [] })),
        axios.get("/services/").catch(() => ({ data: [] })),
      ]);
      setArtists(Array.isArray(artistsRes.value?.data) ? artistsRes.value.data : []);
      setServices(Array.isArray(servicesRes.value?.data) ? servicesRes.value.data : []);
    } catch (err) {
      console.error("Error in fetchDropdownData:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDropdownData();
  }, []);

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
    setIsNewClient(false);
    setSelectedClient(null);
    setNewClientData({ first_name: "", last_name: "", email: "", phone: "" });
    setOpenModal(true);
  };

  const handleSelectEvent = (event) => {
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
      endTime: appt.end_time ? appt.end_time.slice(0, 5) : moment(`${appt.date}T${appt.time}`).add(1, "hour").format("HH:mm"),
      notes: appt.notes || "",
    });
    setOpenModal(true);
  };

  const eventPropGetter = (event) => {
    let backgroundColor = "#9e9e9e";
    if (event.status === "confirmed") backgroundColor = "#4caf50";
    if (event.status === "pending") backgroundColor = "#ffc107";
    if (event.status === "canceled") backgroundColor = "#f44336";
    return { style: { backgroundColor } };
  };

  useEffect(() => {
    if (searchQuery.length >= 2) {
      axios
        .get(`/clients/?search=${encodeURIComponent(searchQuery)}`)
        .then((res) => setSearchResults(res.data))
        .catch((err) => {
          console.error("Error searching clients:", err);
          setSearchResults([]);
        });
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEvent(null);
  };

  const handleSaveAppointment = async () => {
    const isAdmin = user?.role === "admin";
    let requestData = {
      employee: formData.employee,
      service: formData.service,
      price: formData.price,
      date: formData.date,
      time: formData.startTime + ":00",
      end_time: formData.endTime + ":00",
      notes: formData.notes,
      status: isAdmin ? "confirmed" : "pending",
      requires_approval: !isAdmin,
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
        employee: formData.employee,
      };
    } else {
      const clientId = selectedClient?.id ?? selectedEvent?.extendedAppt?.client?.id;
      if (!clientId) {
        alert("Error: Client information is missing. Please select a client.");
        return;
      }
      requestData.client_id = clientId;
    }

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
        alert("Appointment rescheduled successfully.");
        setAppointments((prevAppointments) =>
          prevAppointments.map((appt) =>
            appt.id === selectedEvent.id
              ? {
                  ...appt,
                  start: moment(`${response.data.date}T${response.data.time}`).toDate(),
                  end: moment(`${response.data.date}T${response.data.end_time}`).toDate(),
                  status: response.data.status,
                  extendedAppt: response.data,
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
        alert(isAdmin ? "Appointment confirmed!" : "Appointment requested and pending approval.");
        setAppointments((prevAppointments) => [
          ...prevAppointments,
          {
            id: response.data.id,
            title: `${response.data.client?.first_name ?? "Unknown"} (${response.data.status})`,
            start: moment(`${response.data.date}T${response.data.time}`).toDate(),
            end: moment(`${response.data.date}T${response.data.end_time}`).toDate(),
            status: response.data.status,
            extendedAppt: response.data,
          },
        ]);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Error saving appointment:", err);
      alert(JSON.stringify(err.response?.data, null, 2) || "Error saving appointment.");
    }
  };

  // New function to mark an appointment as Completed
  const handleMarkCompleted = async () => {
    if (!selectedEvent) {
      alert("No appointment selected");
      return;
    }
    try {
      const requestData = { status: "completed" };
      const response = await axios.patch(
        `/appointments/${selectedEvent.id}/reschedule/`,
        requestData,
        { headers: { "X-CSRFToken": await getCSRFToken() } }
      );
      alert("Appointment marked as Completed.");
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt.id === selectedEvent.id
            ? {
                ...appt,
                start: moment(`${response.data.date}T${response.data.time}`).toDate(),
                end: moment(`${response.data.date}T${response.data.end_time}`).toDate(),
                status: response.data.status,
                extendedAppt: response.data,
              }
            : appt
        )
      );
      handleCloseModal();
    } catch (err) {
      console.error("Error marking appointment as completed:", err);
      alert("Error marking appointment as completed.");
    }
  };

  // New function to mark an appointment as No Show
  const handleMarkNoShow = async () => {
    if (!selectedEvent) {
      alert("No appointment selected");
      return;
    }
    try {
      const requestData = { status: "no_show" };
      const response = await axios.patch(
        `/appointments/${selectedEvent.id}/reschedule/`,
        requestData,
        { headers: { "X-CSRFToken": await getCSRFToken() } }
      );
      alert("Appointment marked as No Show.");
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt.id === selectedEvent.id
            ? {
                ...appt,
                start: moment(`${response.data.date}T${response.data.time}`).toDate(),
                end: moment(`${response.data.date}T${response.data.end_time}`).toDate(),
                status: response.data.status,
                extendedAppt: response.data,
              }
            : appt
        )
      );
      handleCloseModal();
    } catch (err) {
      console.error("Error marking appointment as no show:", err);
      alert("Error marking appointment as no show.");
    }
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
            {!isNewClient && (
              <Grid item xs={12}>
                <Autocomplete
                  value={selectedClient}
                  onChange={(event, newValue) => setSelectedClient(newValue)}
                  onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)}
                  options={searchResults}
                  getOptionLabel={(option) =>
                    `${option.first_name} ${option.last_name} (${option.email})`
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField {...params} label="Search or Select Client" variant="outlined" />
                  )}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsNewClient(!isNewClient);
                  if (!isNewClient) setSelectedClient(null);
                  else setNewClientData({ first_name: "", last_name: "", email: "", phone: "" });
                }}
              >
                {isNewClient ? "Use Existing Client" : "Create New Client"}
              </Button>
            </Grid>
            {isNewClient && (
              <>
                <Grid item xs={6}>
                  <TextField
                    label="First Name"
                    fullWidth
                    value={newClientData.first_name}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, first_name: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    value={newClientData.last_name}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, last_name: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    fullWidth
                    value={newClientData.email}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, email: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Phone"
                    fullWidth
                    value={newClientData.phone}
                    onChange={(e) =>
                      setNewClientData({ ...newClientData, phone: e.target.value })
                    }
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <FormControl fullWidth disabled={user?.role === "employee"}>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={formData.employee || ""}
                  onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                >
                  {artists.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
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
            <Grid item xs={12} md={6}>
              <TextField
                label="Price"
                type="number"
                fullWidth
                value={String(formData.price)}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={formData.date || moment().format("YYYY-MM-DD")}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                value={formData.startTime || "00:00"}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="End Time"
                type="time"
                fullWidth
                value={formData.endTime || "00:00"}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                rows={2}
                fullWidth
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
          {selectedEvent && (
            <>
              <Button onClick={handleMarkCompleted} color="success">
                Completed
              </Button>
              <Button onClick={handleMarkNoShow} color="error">
                No Show
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentCalendarPage;
