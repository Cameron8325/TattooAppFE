import React, { useState, useEffect, useRef } from "react";
import Calendar from "@toast-ui/react-calendar";
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import axios from "../services/axios";

const CalendarPage = () => {
  const [appointments, setAppointments] = useState([]);
  const calendarRef = useRef(null); // Reference for the calendar instance

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get("/appointments/");
        const events = response.data.map((appointment) => ({
          id: appointment.id.toString(),
          title: `${appointment.client.first_name} ${appointment.client.last_name}`,
          category: "time",
          start: `${appointment.date}T${appointment.time}`,
          end: `${appointment.date}T${appointment.time}`, // Adjust if you have duration
        }));
        setAppointments(events);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  // Function to handle drag-and-drop rescheduling
  const handleEventDrop = async (event) => {
    const appointmentId = event.schedule.id;
    const newDate = event.start.toISOString().split("T")[0]; // Extract date
    const newTime = event.start.toISOString().split("T")[1].substring(0, 8); // Extract time

    try {
      await axios.patch(`/api/appointments/${appointmentId}/reschedule/`, {
        date: newDate,
        time: newTime,
      });

      // Update state instantly for UI responsiveness
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId ? { ...appt, start: `${newDate}T${newTime}`, end: `${newDate}T${newTime}` } : appt
        )
      );
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
    }
  };

  return (
    <div>
      <h1>Calendar</h1>
      <Calendar
        ref={calendarRef}
        height="800px"
        view="month" // Options: month, week, day
        schedules={appointments}
        usageStatistics={false}
        taskView={false}
        template={{
          time: (schedule) => `${schedule.title}`,
        }}
        useDetailPopup={true}
        useCreationPopup={true}
        onBeforeUpdateSchedule={handleEventDrop} // Detect drag-and-drop events
      />
    </div>
  );
};

export default CalendarPage;
