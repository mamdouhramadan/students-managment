import React, { useLayoutEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import LoadingSpinner from './components/LoadingSpinner';
import { useStudentStore } from './flux/useStores';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getBrandPrimary, tableHeadBg } from './theme/brandPalette';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AppRoutes } from './routers';
import { LanguageProvider, useLanguage } from './providers/LanguageProvider';
import { ThemeColorProvider, useThemeColor } from './providers/ThemeColorProvider';
import { ThemeModeProvider, useThemeMode } from './providers/ThemeModeProvider';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

/** Above Vaul drawers (tooltip tier ~1500) and MUI modal (1300) so poppers/menus stay visible. */
const DROPDOWN_Z_INDEX = 1600;

function AppShell() {
  const { loading } = useStudentStore();
  const { isAuthenticated } = useAuth();
  const { direction, dateLocale } = useLanguage();
  const { brandColor } = useThemeColor();
  const { resolvedMode } = useThemeMode();

  const theme = useMemo(
    () =>
      createTheme({
        direction,
        typography: {
          fontFamily: '"Almarai", "Segoe UI", sans-serif',
        },
        palette: {
          mode: resolvedMode,
          primary: getBrandPrimary(brandColor, resolvedMode),
          divider:
            resolvedMode === 'dark' ? alpha('#ffffff', 0.12) : alpha('#000000', 0.12),
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                fontFamily: '"Almarai", "Segoe UI", sans-serif',
              },
            },
          },
          MuiPopper: {
            styleOverrides: {
              root: {
                zIndex: DROPDOWN_Z_INDEX,
              },
            },
          },
          MuiPopover: {
            styleOverrides: {
              root: {
                zIndex: DROPDOWN_Z_INDEX,
              },
            },
          },
          MuiAutocomplete: {
            defaultProps: {
              PopperProps: {
                sx: { zIndex: DROPDOWN_Z_INDEX },
              },
            },
          },
          MuiPickersPopper: {
            styleOverrides: {
              root: {
                zIndex: DROPDOWN_Z_INDEX,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: ({ theme: th, ownerState }) => {
                if (ownerState.variant === 'outlined') {
                  return {
                    borderColor: th.palette.divider,
                    backgroundImage: 'none',
                  };
                }
                return {};
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: ({ theme: th }) => ({
                backgroundImage: 'none',
                ...(th.palette.mode === 'dark' && {
                  borderColor: alpha(th.palette.common.white, 0.14),
                  backgroundColor: th.palette.background.paper,
                }),
              }),
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: ({ theme: th }) => ({
                borderColor: th.palette.divider,
              }),
              head: ({ theme: th }) => ({
                backgroundColor: tableHeadBg(th),
                color: th.palette.text.primary,
                fontWeight: 600,
              }),
            },
          },
        },
      }),
    [direction, brandColor, resolvedMode]
  );

  useLayoutEffect(() => {
    const root = document.documentElement;
    const { palette } = theme;
    root.style.setProperty('--main-color', palette.primary.main);
    root.style.setProperty('--body-color', palette.background.default);
    root.style.setProperty('--text-color', palette.text.primary);
    root.style.setProperty('--surface-paper', palette.background.paper);
    root.style.setProperty('--white-color', palette.background.paper);
    root.style.colorScheme = palette.mode === 'dark' ? 'dark' : 'light';
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
        <CssBaseline enableColorScheme />
        <AppRoutes />
        {isAuthenticated && loading && <LoadingSpinner />}
        <ToastContainer
          rtl={direction === 'rtl'}
          theme={resolvedMode === 'dark' ? 'dark' : 'light'}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ThemeColorProvider>
      <LanguageProvider>
        <ThemeModeProvider>
          <AppShell />
        </ThemeModeProvider>
      </LanguageProvider>
    </ThemeColorProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <NuqsAdapter>
      <App />
    </NuqsAdapter>
  </BrowserRouter>
);
