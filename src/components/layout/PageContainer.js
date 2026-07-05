// Shared page shell: centers content, applies the canonical page gutter,
// and renders the page title. Body background (ink[50]) comes from
// CssBaseline via theme.palette.background.default.
import { Container, Typography } from "@mui/material";

const PageContainer = ({ title, maxWidth = "lg", children }) => (
  <Container maxWidth={maxWidth} sx={{ py: 4 }}>
    {title && (
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
    )}
    {children}
  </Container>
);

export default PageContainer;
