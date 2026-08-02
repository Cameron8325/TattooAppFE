import { Box, Paper, Typography } from '@mui/material';

const StatCard = ({ label, value, helper, icon, tone = 'secondary' }) => (
  <Paper sx={{ border: 1, borderColor: 'divider', p: 2.25, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
      <Box>
        <Typography variant="overline" component="p" sx={{ color: 'text.secondary' }}>{label}</Typography>
        <Typography variant="h4" component="p" sx={{ mt: 0.5 }}>{value}</Typography>
        {helper && <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mt: 0.5 }}>{helper}</Typography>}
      </Box>
      {icon && (
        <Box sx={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: 1, bgcolor: `${tone}.bg`, color: `${tone}.main` }}>
          {icon}
        </Box>
      )}
    </Box>
  </Paper>
);

export default StatCard;
