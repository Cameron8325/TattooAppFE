// src/pages/AppointmentCalendarPage.js
import React, { useState, useEffect, useContext } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { AuthContext } from "../context/authContext";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "../services/axios";
import AppointmentModal from "../components/adminDash/AppointmentModal"
import { Box, Typography } from "@mui/material";

const localizer = momentLocalizer(moment);

const AppointmentCalendarPage = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // load events
  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get("/appointments/");
      const ev = data.map(appt => {
        const start = moment(`${appt.date}T${appt.time}`).toDate();
        const end = appt.end_time
          ? moment(`${appt.date}T${appt.end_time}`).toDate()
          : moment(start).add(1, "hour").toDate();
        return { id: appt.id, title: `${appt.client.first_name} (${appt.status})`,
                 start, end, status: appt.status, extendedAppt: appt };
      });
      setAppointments(ev);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // slot = create
  const onSelectSlot = ({ start, end }) => {
    setSelectedEvent(null);
    setOpenModal(true);
  };

  // event = edit
  const onSelectEvent = ev => {
    setSelectedEvent(ev.extendedAppt);
    setOpenModal(true);
  };

  const handleClose = () => setOpenModal(false);

  const handleSave = () => {
    fetchAppointments();
    setOpenModal(false);
  };

  // color styling
  const eventPropGetter = e => {
    let bg = "#9e9e9e";
    if      (e.status==="confirmed") bg="#4caf50";
    else if (e.status==="pending")   bg="#ffc107";
    else if (e.status==="canceled")  bg="#f44336";
    return { style: { backgroundColor: bg } };
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Appointment Calendar
      </Typography>

      <Calendar
        localizer={localizer}
        events={appointments}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventPropGetter}
        views={["month","week","day"]}
        defaultView="week"
        style={{ height: 800 }}
      />

      <AppointmentModal
        open={openModal}
        handleClose={handleClose}
        initialData={selectedEvent}
        onSave={handleSave}
        user={user}
      />
    </Box>
  );
};

export default AppointmentCalendarPage;
