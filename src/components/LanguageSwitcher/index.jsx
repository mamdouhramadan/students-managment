import React from 'react';
import { Box, FormControl, MenuItem, Select } from '@mui/material';
import { useLanguage } from '../../providers/LanguageProvider';

const OPTIONS = [
  { code: 'en', flag: '🇬🇧', labelKey: 'language.en' },
  { code: 'ar', flag: '🇸🇦', labelKey: 'language.ar' },
];

const lightText = 'rgba(255, 255, 255, 0.95)';

const LanguageSwitcher = ({ size = 'small', appBar = false }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <FormControl
      size={size}
      sx={{
        // minWidth: appBar ? 158 : 170,
        ...(appBar && {
          '& .MuiOutlinedInput-root': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.05)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.24)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.55)',
            },
          },
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            py: 0.75,
            color: lightText,
          },
          '& .MuiSelect-icon': {
            color: lightText,
          },
        }),
      }}
    >
      <Select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        inputProps={{ 'aria-label': t('language.label') }}
        renderValue={(value) => {
          const opt = OPTIONS.find((o) => o.code === value);
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                ...(appBar && { color: lightText }),
              }}
            >
              <Box component="span" sx={{ fontSize: '1.15rem', lineHeight: 1 }} aria-hidden>
                {opt?.flag}
              </Box>
              {opt ? t(opt.labelKey) : value}
            </Box>
          );
        }}
        sx={{
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            py: 0.75,
            // ...(appBar && { color: lightText }),
          },
          ...(appBar && {
            '& .MuiSelect-icon': { color: lightText },
          }),
        }}
        MenuProps={{ disableScrollLock: true }}
      >
        {OPTIONS.map(({ code, flag, labelKey }) => (
          <MenuItem key={code} value={code}>
            <Box component="span" sx={{ mr: 1, fontSize: '1.1rem' }} aria-hidden>
              {flag}
            </Box>
            {t(labelKey)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;
