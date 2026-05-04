import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import BrightnessAutoOutlined from '@mui/icons-material/BrightnessAutoOutlined';
import { useLanguage } from '../../providers/LanguageProvider';
import { useThemeMode } from '../../providers/ThemeModeProvider';

export default function ThemeModeToggle() {
  const { preference, cycleMode } = useThemeMode();
  const { t } = useLanguage();

  const modeLabel =
    preference === 'system'
      ? t('settings.themeModeSystem')
      : preference === 'dark'
        ? t('settings.themeModeDark')
        : t('settings.themeModeLight');

  const tooltip = `${t('layout.themeModeTooltip')}: ${modeLabel}`;

  const icon =
    preference === 'system' ? (
      <BrightnessAutoOutlined sx={{ fontSize: 22 }} />
    ) : preference === 'dark' ? (
      <DarkModeOutlined sx={{ fontSize: 22 }} />
    ) : (
      <LightModeOutlined sx={{ fontSize: 22 }} />
    );

  return (
    <Tooltip title={tooltip}>
      <IconButton
        color="inherit"
        onClick={cycleMode}
        aria-label={tooltip}
        size="medium"
        sx={{
          transition: (theme) =>
            theme.transitions.create('transform', {
              duration: theme.transitions.duration.shortest,
            }),
          '&:active': {
            transform: 'rotate(-18deg) scale(0.92)',
          },
        }}
      >
        <Box
          key={preference}
          sx={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'themeModeIconIn 0.32s cubic-bezier(0.34, 1.2, 0.64, 1)',
            '@keyframes themeModeIconIn': {
              from: {
                opacity: 0,
                transform: 'rotate(-90deg) scale(0.6)',
              },
              to: {
                opacity: 1,
                transform: 'rotate(0deg) scale(1)',
              },
            },
          }}
        >
          {icon}
        </Box>
      </IconButton>
    </Tooltip>
  );
}
