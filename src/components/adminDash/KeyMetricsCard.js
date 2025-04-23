import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Grid,
  Button, ButtonGroup, TextField
} from "@mui/material";
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h5" gutterBottom>Key Metrics</Typography>

      <ButtonGroup variant="outlined" sx={{ mb: 2, mr: 2 }}>
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
        sx={{ mb: 2 }}
        value={month}
        onChange={handleMonthChange}
      />

      <Grid container spacing={3}>
        {metrics.map(({ metric, value }) => (
          <Grid item xs={12} sm={4} key={metric}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  {metric.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </Typography>
                <Typography variant="h4">
                  {value ?? "—"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default KeyMetrics;
