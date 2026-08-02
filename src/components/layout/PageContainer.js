import { Box, Container, Typography } from '@mui/material';

const PageContainer = ({ eyebrow, title, subtitle, actions, maxWidth = 'xl', children }) => (
  <Container maxWidth={maxWidth} sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 3, lg: 4 } }}>
    {(title || actions) && (
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'flex-end' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {eyebrow && <Typography variant="overline" sx={{ color: 'primary.main' }}>{eyebrow}</Typography>}
          {title && <Typography variant="h4" component="h1">{title}</Typography>}
          {subtitle && (
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 680 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
      </Box>
    )}
    {children}
  </Container>
);

export default PageContainer;
