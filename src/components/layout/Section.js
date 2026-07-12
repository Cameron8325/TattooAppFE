// Shared card shell — bordered flat Paper with generous internal padding,
// an optional subtitle + action slot in the header, and a subtle
// hover treatment (border-color shift + soft shadow) to signal
// interactivity. Children render content only.
import { Box, Paper, Typography } from "@mui/material";

const Section = ({ title, subtitle, action, children, sx = {} }) => (
  <Paper
    sx={{
      p: { xs: 3, md: 4 },
      height: "100%",
      transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      "&:hover": {
        borderColor: "neutral.main",
        boxShadow: 1,
      },
      ...sx,
    }}
  >
    {(title || action) && (
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          {title && (
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" component="p" sx={{ color: "text.secondary", mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
    )}
    {children}
  </Paper>
);

export default Section;
