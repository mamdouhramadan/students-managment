import React from 'react';
import { Avatar, Box, Typography, useTheme, alpha } from '@mui/material';

/**
 * Light-background stat tile with icon (for reports / dashboards).
 */
const ReportStatCard = ({ icon: Icon, label, value, color = 'primary' }) => {
  const theme = useTheme();
  const paletteColor = theme.palette[color] || theme.palette.primary;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: alpha(paletteColor.main, 0.08),
        border: '1px solid',
        borderColor: alpha(paletteColor.main, 0.12),
        height: '100%',
      }}
    >
      <Avatar
        variant="rounded"
        sx={{
          width: 48,
          height: 48,
          bgcolor: alpha(paletteColor.main, 0.14),
          color: paletteColor.main,
        }}
      >
        {Icon ? <Icon fontSize="small" /> : null}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block" noWrap>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

export default ReportStatCard;
