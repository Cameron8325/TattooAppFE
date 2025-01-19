import React, { useState, useEffect } from 'react';
import Calendar from '@toast-ui/react-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import { Box, Typography } from '@mui/material';
import axios from '../services/axios';

const AppointmentCalendarPage = () => {
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        axios.get('/appointments/')
            .then((response) => {
                const events = response.data.map((appointment) => ({
                    id: appointment.id.toString(),
                    title: `${appointment.client}: ${appointment.service}`,
                    category: 'time',
                    start: `${appointment.date}T${appointment.time}`,
                    end: `${appointment.date}T${appointment.time}`,
                }));
                setAppointments(events);
            })
            .catch(() => {
                setAppointments([
                    {
                        id: '1',
                        title: 'John Doe: Tattoo',
                        category: 'time',
                        start: '2025-01-15T10:00:00',
                        end: '2025-01-15T11:00:00',
                    },
                    {
                        id: '2',
                        title: 'Jane Smith: Piercing',
                        category: 'time',
                        start: '2025-01-15T13:00:00',
                        end: '2025-01-15T14:00:00',
                    },
                ]);
            });
    }, []);
    

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Appointment Calendar
            </Typography>
            <Calendar
                height="800px"
                view="month"
                usageStatistics={false} // Optional: Prevents sending usage data
                schedules={appointments}
                template={{
                    time: function(schedule) {
                        return `<span>${schedule.title}</span>`;
                    },
                }}
            />
        </Box>
    );
};

export default AppointmentCalendarPage;
