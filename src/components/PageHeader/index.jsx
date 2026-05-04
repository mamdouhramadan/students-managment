import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Page title + subtitle (same pattern as Reports). Optional right-side action (e.g. primary button).
 */
const PageHeader = ({ title, subtitle, action, sx }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 2,
      flexWrap: 'wrap',
      mb: 3,
      ...sx,
    }}
  >
    <Box sx={{ flex: '1 1 240px', minWidth: 0 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: subtitle ? 0.5 : 0 }}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
    </Box>
    {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
  </Box>
);

export default PageHeader;
