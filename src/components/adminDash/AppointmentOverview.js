import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Grid, Button, Stack } from "@mui/material";

const AppointmentOverview = () => {
  const [data, setData] = useState({ total: 0, completed: 0, pending: 0, canceled: 0 });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchMockData = async () => {
      // Simulate a network delay
      setTimeout(() => {
        const mockAppointmentOverviewData = {
          total: 45,
          completed: 30,
          pending: 10,
          canceled: 5,
        };
        setData(mockAppointmentOverviewData);
      }, 1000); // Simulated delay of 1 second
    };

    fetchMockData();
  }, [filter]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant={filter === "all" ? "contained" : "outlined"} onClick={() => setFilter("all")}>
          All
        </Button>
        <Button variant={filter === "today" ? "contained" : "outlined"} onClick={() => setFilter("today")}>
          Today
        </Button>
        <Button variant={filter === "this_week" ? "contained" : "outlined"} onClick={() => setFilter("this_week")}>
          This Week
        </Button>
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Total Appointments
              </Typography>
              <Typography variant="h4">{data.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Completed
              </Typography>
              <Typography variant="h4">{data.completed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Pending
              </Typography>
              <Typography variant="h4">{data.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Canceled
              </Typography>
              <Typography variant="h4">{data.canceled}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AppointmentOverview;
