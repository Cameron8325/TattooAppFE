import React, { useState, useEffect, useContext, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { AuthContext } from "../context/authContext";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "../services/axios";
import AppointmentModal from "../components/adminDash/AppointmentModal";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

const localizer = momentLocalizer(moment);

const AppointmentCalendarPage = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");

  const fetchAppointments = useCallback(async () => {
    try {
      const urlParams = new URLSearchParams();
      if (selectedEmployee !== "all") {
        urlParams.append("employee", selectedEmployee);
      }
  
      const { data } = await axios.get(`/appointments/?${urlParams.toString()}`);
      const ev = data.map(appt => {
        const start = moment(`${appt.date}T${appt.time ?? '00:00'}`).toDate();
        const end = appt.end_time
          ? moment(`${appt.date}T${appt.end_time}`).toDate()
          : moment(start).add(1, "hour").toDate();
        return {
          id: appt.id,
          title: `${appt.client?.first_name || 'Client'} (${appt.status})`,
          start,
          end,
          status: appt.status,
          extendedAppt: appt
        };
      });
      setAppointments(ev);
    } catch (e) {
      console.error(e);
    }
  }, [selectedEmployee]);
  
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (user?.role === "admin") {
      axios.get("/users/?role=employee")
        .then(res => setEmployees(res.data))
        .catch(console.error);
    }
  }, [user]);

  const onSelectSlot = ({ start, end }) => {
    setSelectedEvent(null);
    setOpenModal(true);
  };

  const onSelectEvent = ev => {
    setSelectedEvent(ev.extendedAppt);
    setOpenModal(true);
  };

  const handleClose = () => setOpenModal(false);

  const handleSave = () => {
    fetchAppointments();
    setOpenModal(false);
  };

  const eventPropGetter = e => {
    let bg = "#9e9e9e";
    if (e.status === "confirmed") bg = "#4caf50";
    else if (e.status === "pending") bg = "#ffc107";
    else if (e.status === "canceled") bg = "#f44336";
    return { style: { backgroundColor: bg } };
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Appointment Calendar
      </Typography>

      {user?.role === "admin" && (
        <Box sx={{ mb: 2, width: 250 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Employee</InputLabel>
            <Select
              value={selectedEmployee}
              label="Filter by Employee"
              onChange={e => setSelectedEmployee(e.target.value)}
            >
              <MenuItem value="all">All Employees</MenuItem>
              {employees.map(emp => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.username || emp.full_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

<Calendar
  localizer={localizer}
  events={appointments}
  startAccessor="start"
  endAccessor="end"
  selectable
  onSelectSlot={onSelectSlot}
  onSelectEvent={onSelectEvent}
  eventPropGetter={eventPropGetter}
  views={["month", "week", "day"]}
  defaultView="month"  // <- ✅ Starts in month view
  min={new Date(0, 0, 0, 8, 0)} // <- ✅ Start at 8AM
  max={new Date(0, 0, 0, 20, 0)} // <- ✅ End at 8PM
  style={{ height: 800 }}
/>


{user && (
  <AppointmentModal
    open={openModal}
    handleClose={handleClose}
    initialData={selectedEvent}
    onSave={handleSave}
    user={user}
  />
)}

    </Box>
  );
};

export default AppointmentCalendarPage;
