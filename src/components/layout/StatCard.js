// Stat module: overline label in secondary ink over a high-contrast value.
// Used by AppointmentOverview and KeyMetricsCard for consistent density.
import { Card, CardContent, Typography } from "@mui/material";

const StatCard = ({ label, value }) => (
  <Card
    sx={{
      height: "100%",
      transition: "border-color 0.2s ease-in-out",
      "&:hover": { borderColor: "neutral.main" },
    }}
  >
    <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
      <Typography
        variant="overline"
        component="p"
        sx={{ color: "text.secondary", letterSpacing: "0.08em", lineHeight: 1.6, mb: 0.5 }}
      >
        {label}
      </Typography>
      <Typography variant="h4" component="p">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default StatCard;
