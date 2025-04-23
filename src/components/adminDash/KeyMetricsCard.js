import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import axios from "../../services/axios.js";

const KeyMetrics = () => {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    axios.get("metrics/")
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
  }, []);
  

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {metrics.map(({ metric, value }) => (
          <Grid item xs={12} sm={4} key={metric}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  {metric}
                </Typography>
                <Typography variant="h4">{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default KeyMetrics;
