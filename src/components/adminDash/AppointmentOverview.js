import React, { useState, useEffect } from "react";
import { Box, Grid, Button, Stack } from "@mui/material";
import StatCard from "../layout/StatCard";

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
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
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
      <Grid container spacing={3}>
        {STAT_LABELS.map(({ key, label }) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <StatCard label={label} value={data[key]} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AppointmentOverview;
