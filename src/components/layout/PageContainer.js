// Shared page shell — "gallery" spacing pass:
// generous vertical rhythm, title block with optional subtitle and an
// actions slot (right-aligned buttons/filters). Body background (ink[50])
// comes from CssBaseline via theme.palette.background.default.
import { Box, Container, Typography } from "@mui/material";

const PageContainer = ({ title, subtitle, actions, maxWidth = "lg", children }) => (
  <Container maxWidth={maxWidth} sx={{ py: { xs: 4, md: 6 } }}>
    {(title || actions) && (
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          mb: { xs: 3, md: 5 },
        }}
      >
        <Box>
          {title && (
            <Typography variant="h4" component="h1">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body1" sx={{ color: "text.secondary", mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions}
      </Box>
    )}
    {children}
  </Container>
);

export default PageContainer;
