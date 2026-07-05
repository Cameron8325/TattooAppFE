import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Grid, Button, Stack } from "@mui/material";

const STAT_LABELS = [
  { key: "total", label: "Total Appointments" },
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" },
  { key: "canceled", label: "Canceled" },
];

const AppointmentOverview = () => {
  const [data, setData] = useState({ total: 0, completed: 0, pending: 0, canceled: 0 });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // TODO(Phase 5): replace mock with GET /appointments/overview/?filter=...
    const fetchMockData = async () => {
      setTimeout(() => {
        setData({ total: 45, completed: 30, pending: 10, canceled: 5 });
      }, 1000);
    };

    fetchMockData();
  }, [filter]);

  return (
    // Parent Paper owns padding + heading; this component renders content only.
    <Box sx={{ flexGrow: 1 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {["all", "today", "this_week"].map((value) => (
          <Button
            key={value}
            variant={filter === value ? "contained" : "outlined"}
            onClick={() => setFilter(value)}
          >
            {value === "all" ? "All" : value === "today" ? "Today" : "This Week"}
          </Button>
        ))}
      </Stack>
      <Grid container spacing={2}>
        {STAT_LABELS.map(({ key, label }) => (
          <Grid item xs={12} sm={3} key={key}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {label}
                </Typography>
                <Typography variant="h4" component="p">{data[key]}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AppointmentOverview;
