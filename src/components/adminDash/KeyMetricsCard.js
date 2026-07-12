import React, { useEffect, useState } from "react";
import {
  Box, Grid,
  Button, ButtonGroup, TextField
} from "@mui/material";
import StatCard from "../layout/StatCard";
import axios from "../../services/axios.js";

const KeyMetrics = () => {
  const [metrics, setMetrics] = useState([]);
  const [range, setRange] = useState("last_30_days");
  const [month, setMonth] = useState("");

  useEffect(() => {
    let url = "metrics/";
    if (range) {
      url += `?range=${range}`;
    } else if (month) {
      url += `?month=${month}`;
    }

    axios.get(url)
      .then((response) => {
        const data = response.data;
        const formatted = Object.entries(data).map(([metric, value]) => ({
          metric,
          value,
        }));
        setMetrics(formatted);
      })
      .catch((err) => {
        console.error("Failed to fetch metrics:", err);
      });
  }, [range, month]);

  const handleMonthChange = (e) => {
    setRange(""); // Clear range when using month
    setMonth(e.target.value);
  };

  return (
    // Parent Paper owns padding + heading ("Key Metrics" duplicate removed).
    <Box sx={{ flexGrow: 1 }}>
      <ButtonGroup variant="outlined" sx={{ mb: 3, mr: 2 }}>
        <Button
          onClick={() => {
            setRange("last_7_days");
            setMonth("");
          }}
          variant={range === "last_7_days" ? "contained" : "outlined"}
        >
          Last 7 Days
        </Button>
        <Button
          onClick={() => {
            setRange("last_30_days");
            setMonth("");
          }}
          variant={range === "last_30_days" ? "contained" : "outlined"}
        >
          Last 30 Days
        </Button>
      </ButtonGroup>

      <TextField
        type="month"
        label="Select Month"
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 3 }}
        value={month}
        onChange={handleMonthChange}
      />

      <Grid container spacing={3}>
        {metrics.map(({ metric, value }) => (
          <Grid item xs={12} sm={6} md={4} key={metric}>
            <StatCard
              label={metric.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              value={value ?? "—"}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default KeyMetrics;
