// Shared card shell: bordered flat Paper (theme default) with an optional
// section heading. Children render content only — no double padding.
import { Paper, Typography } from "@mui/material";

const Section = ({ title, children, sx = {} }) => (
  <Paper sx={{ p: 3, height: "100%", ...sx }}>
    {title && (
      <Typography variant="h6" component="h2" gutterBottom>
        {title}
      </Typography>
    )}
    {children}
  </Paper>
);

export default Section;
