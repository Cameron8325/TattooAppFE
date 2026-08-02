import { Box, Paper, Typography } from '@mui/material';

const Section = ({ title, subtitle, action, children, sx = {}, contentSx = {} }) => (
  <Paper sx={{ border: 1, borderColor: 'divider', height: '100%', overflow: 'hidden', ...sx }}>
    {(title || action) && (
      <Box
        sx={{
          px: { xs: 2, md: 2.5 },
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {title && <Typography variant="h6" component="h2">{title}</Typography>}
          {subtitle && <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mt: 0.25 }}>{subtitle}</Typography>}
        </Box>
        {action}
      </Box>
    )}
    <Box sx={{ p: { xs: 2, md: 2.5 }, ...contentSx }}>{children}</Box>
  </Paper>
);

export default Section;
