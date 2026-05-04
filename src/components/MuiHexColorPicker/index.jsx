import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  Box,
  Button,
  InputAdornment,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ColorizeOutlined from '@mui/icons-material/ColorizeOutlined';
import { alpha, useTheme } from '@mui/material/styles';
import { normalizeHex } from '../../utils/siteTheme';

/**
 * MUI TextField + Popover with react-colorful hex picker (MUI-styled; no official @mui color package).
 */
export default function MuiHexColorPicker({
  label,
  value,
  onChange,
  error,
  helperText,
  disabled,
}) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const safe = normalizeHex(value) || '#8854d0';

  const iconColorOnBg = (hex) => {
    const h = String(hex).replace('#', '');
    if (h.length !== 6) return theme.palette.common.white;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return l > 0.55 ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.95)';
  };

  const handlePickerChange = (hex) => {
    onChange(hex);
  };

  return (
    <>
      <TextField
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        variant="outlined"
        disabled={disabled}
        error={error}
        helperText={helperText}
        InputLabelProps={{ shrink: true }}
        placeholder="#8854d0"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ mr: 0 }}>
              <Button
                type="button"
                size="small"
                variant="outlined"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                disabled={disabled}
                aria-label="Open color picker"
                sx={{
                  minWidth: 44,
                  width: 44,
                  height: 40,
                  p: 0,
                  borderColor: 'divider',
                  bgcolor: safe,
                  backgroundImage: `linear-gradient(180deg, ${alpha('#fff', 0.15)}, transparent)`,
                  '&:hover': {
                    bgcolor: safe,
                    opacity: 0.92,
                  },
                }}
              >
                <ColorizeOutlined sx={{ color: iconColorOnBg(safe), fontSize: 20 }} />
              </Button>
            </InputAdornment>
          ),
        }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          elevation: 8,
          sx: {
            p: 2,
            mt: 1,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
          },
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          <Box
            sx={{
              width: 260,
              maxWidth: '100%',
              '& .react-colorful': {
                width: '100%',
                height: 180,
                borderRadius: 1,
                overflow: 'hidden',
              },
              '& .react-colorful__saturation': {
                borderRadius: '4px 4px 0 0',
              },
              '& .react-colorful__hue': {
                height: 14,
                borderRadius: '0 0 4px 4px',
              },
            }}
          >
            <HexColorPicker color={safe} onChange={handlePickerChange} />
          </Box>
          <Typography variant="body2" fontFamily="monospace" color="text.primary">
            {normalizeHex(value) || safe}
          </Typography>
        </Stack>
      </Popover>
    </>
  );
}
