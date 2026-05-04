import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Alert,
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Container,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LogoutIcon from '@mui/icons-material/Logout';
import UserAppBarMenu from '../components/UserAppBarMenu';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeModeToggle from '../components/ThemeModeToggle';
import GlobalSearchBar from '../components/GlobalSearchBar';
import { userActions } from '../helpers';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../providers/LanguageProvider';
import { useThemeColor } from '../providers/ThemeColorProvider';
import logoImg from '../assets/images/logo.png';

const ANNOUNCEMENT_DISMISS_KEY = 'stroika_announcement_dismissed_hash';

function hashAnnouncementText(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = Math.imul(31, h) + s.charCodeAt(i);
  }
  return String(h);
}

const DRAWER_EXPANDED = 260;
const DRAWER_COLLAPSED = 72;
const SIDEBAR_STORAGE_KEY = 'stroika_sidebar_collapsed';
const MAIN_CONTENT_MAX_WIDTH = 1400;

const baseNavItems = [
  { labelKey: 'nav.home', path: '/', icon: <DashboardIcon /> },
  { labelKey: 'nav.students', path: '/students', icon: <SchoolIcon /> },
  { labelKey: 'nav.parents', path: '/parents', icon: <FamilyRestroomIcon /> },
  { labelKey: 'nav.timetable', path: '/timetable', icon: <EventNoteIcon /> },
];

const staffNavItems = [
  { labelKey: 'nav.reminders', path: '/reminders', icon: <TaskAltOutlined /> },
];

const adminNavItems = [
  { labelKey: 'nav.users', path: '/admin/users', icon: <PeopleIcon /> },
  { labelKey: 'nav.teachers', path: '/admin/teachers', icon: <CoPresentIcon /> },
  { labelKey: 'nav.settings', path: '/admin/settings', icon: <SettingsIcon /> },
  { labelKey: 'nav.gradesClasses', path: '/admin/grades-classes', icon: <AccountTreeIcon /> },
  { labelKey: 'nav.courses', path: '/admin/courses', icon: <MenuBookIcon /> },
];

const DashboardLayout = () => {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const drawerAnchor = isRtl ? 'right' : 'left';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isStudent } = useAuth();
  const { t } = useLanguage();
  const { announcement } = useThemeColor();
  const [announcementDismissed, setAnnouncementDismissed] = useState(true);

  useEffect(() => {
    if (!announcement) {
      setAnnouncementDismissed(true);
      return;
    }
    try {
      const h = hashAnnouncementText(announcement);
      setAnnouncementDismissed(
        sessionStorage.getItem(ANNOUNCEMENT_DISMISS_KEY) === h
      );
    } catch {
      setAnnouncementDismissed(false);
    }
  }, [announcement]);

  const showAnnouncementBanner = Boolean(announcement) && !announcementDismissed;

  const dismissAnnouncement = () => {
    if (!announcement) return;
    try {
      sessionStorage.setItem(
        ANNOUNCEMENT_DISMISS_KEY,
        hashAnnouncementText(announcement)
      );
    } catch {
      /* ignore */
    }
    setAnnouncementDismissed(true);
  };

  const drawerWidth = collapsed ? DRAWER_COLLAPSED : DRAWER_EXPANDED;

  const navItems = useMemo(() => {
    const base = isStudent ? [...baseNavItems] : [...baseNavItems, ...staffNavItems];
    if (isAdmin) {
      return [...base, ...adminNavItems];
    }
    return base;
  }, [isAdmin, isStudent]);

  const bottomNavValue = useMemo(() => {
    const p = location.pathname;
    const sorted = [...navItems].sort((a, b) => b.path.length - a.path.length);
    const hit = sorted.find((n) =>
      n.path === '/' ? p === '/' : p === n.path || p.startsWith(`${n.path}/`)
    );
    return hit ? hit.path : false;
  }, [location.pathname, navItems]);

  const pageTitle = useMemo(() => {
    if (location.pathname === '/profile/password') return t('pageTitle.changePassword');
    if (location.pathname === '/profile') return t('pageTitle.editProfile');
    if (location.pathname.startsWith('/admin/users')) return t('pageTitle.userManagement');
    if (location.pathname.startsWith('/admin/teachers')) return t('pageTitle.teachers');
    if (location.pathname.startsWith('/admin/settings')) return t('pageTitle.settings');
    if (location.pathname.startsWith('/admin/grades-classes')) return t('pageTitle.gradesClasses');
    if (location.pathname.startsWith('/admin/courses')) return t('pageTitle.courses');
    const match = navItems.find((n) => n.path === location.pathname);
    return match ? t(match.labelKey) : t('layout.dashboard');
  }, [location.pathname, navItems, t]);

  const tooltipPlacement = isRtl ? 'left' : 'right';

  const renderDrawerContent = (forMobile) => {
    const narrow = forMobile ? false : collapsed;
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Toolbar
          sx={{
            px: narrow ? 0.5 : 1.5,
            justifyContent: 'center',
            minHeight: 64,
          }}
        >
          <Box
            component="img"
            src={logoImg}
            alt={t('layout.brand')}
            sx={{
              display: 'block',
              width: narrow ? 44 : '100%',
              maxWidth: '100%',
              height: narrow ? 44 : 'auto',
              maxHeight: narrow ? 44 : 48,
              objectFit: 'contain',
            }}
          />
        </Toolbar>
        <Divider />
        <List sx={{ flex: 1, py: 1, px: narrow ? 0.5 : 0 }}>
          {navItems.map((item) => {
            const selected =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`);
            const btn = (
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                }}
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  justifyContent: narrow ? 'center' : 'flex-start',
                  px: narrow ? 1 : 2,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: narrow ? 0 : 40,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!narrow && <ListItemText primary={t(item.labelKey)} />}
              </ListItemButton>
            );
            return (
              <ListItem key={item.path} disablePadding>
                {narrow ? (
                  <Tooltip title={t(item.labelKey)} placement={tooltipPlacement}>
                    {btn}
                  </Tooltip>
                ) : (
                  btn
                )}
              </ListItem>
            );
          })}
        </List>
        
        <Divider />
        <Box sx={{ p: narrow ? 0.5 : 1, pb: narrow ? 1 : 1.5 }}>
          {narrow ? (
            <Tooltip title={t('userMenu.logout')} placement={tooltipPlacement}>
              <ListItemButton
                onClick={() => {
                  userActions.logout();
                  navigate('/login', { replace: true });
                }}
                sx={{
                  borderRadius: 1,
                  justifyContent: 'center',
                  py: 1,
                  color: 'error.main',
                }}
              >
                <LogoutIcon />
              </ListItemButton>
            </Tooltip>
          ) : (
            <ListItemButton
              onClick={() => {
                userActions.logout();
                navigate('/login', { replace: true });
              }}
              sx={{
                borderRadius: 1,
                mx: 0.5,
                color: 'error.main',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary={t('userMenu.logout')} sx={{ textAlign: 'start' }} />
            </ListItemButton>
          )}
        </Box>
      </Box>
    );
  };

  /**
   * Fixed AppBar must sit only above the main column (not under the drawer).
   * LTR: drawer left → bar starts at left: drawerWidth, width = 100% − drawerWidth.
   * RTL: drawer right → bar starts at left: 0, width = 100% − drawerWidth (same visual as MUI docs).
   */
  const appBarSx = {
    position: 'fixed',
    top: 0,
    zIndex: theme.zIndex.drawer + 1,
    width: {
      xs: '100%',
      md: `calc(100% - ${drawerWidth}px)`,
    },
    left: {
      xs: 0,
      md: isRtl ? 0 : `${drawerWidth}px`,
    },
    right: { xs: 0, md: 'auto' },
    transition: (tr) =>
      tr.transitions.create(['width', 'left'], {
        easing: tr.transitions.easing.sharp,
        duration: tr.transitions.duration.enteringScreen,
      }),
  };

  const mobileBottomNav = isMobile ? (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        borderRadius: 0,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <BottomNavigation
        showLabels
        value={bottomNavValue}
        onChange={(_, newPath) => {
          if (newPath) navigate(newPath);
        }}
        sx={{
          minHeight: 56,
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            whiteSpace: 'nowrap',
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={t(item.labelKey)}
            icon={item.icon}
            value={item.path}
          />
        ))}
      </BottomNavigation>
    </Paper>
  ) : null;

  const navColumn = !isMobile ? (
    <Box
      key="nav"
      component="nav"
      sx={{
        width: { md: drawerWidth },
        flexShrink: { md: 0 },
        transition: (tr) =>
          tr.transitions.create('width', {
            easing: tr.transitions.easing.sharp,
            duration: tr.transitions.duration.enteringScreen,
          }),
      }}
    >
      <Drawer
        variant="permanent"
        anchor={drawerAnchor}
        sx={{
          display: { md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            transition: (tr) =>
              tr.transitions.create('width', {
                easing: tr.transitions.easing.sharp,
                duration: tr.transitions.duration.enteringScreen,
              }),
            overflowX: 'hidden',
          },
        }}
        open
      >
        {renderDrawerContent(false)}
      </Drawer>
    </Box>
  ) : null;

  const mainColumn = (
    <Box
      key="main"
      sx={{
        flexGrow: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar position="fixed" sx={appBarSx}>
        <Toolbar
          sx={{
            position: 'relative',
            gap: { xs: 0.5, sm: 1 },
            px: { xs: 1.5, sm: 2 },
            minHeight: 64,
          }}
        >
          <Box
            sx={{
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              zIndex: 2,
            }}
          >
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setCollapsed((c) => !c)}
              sx={{
                marginInlineEnd: 0,
                display: { xs: 'none', md: 'inline-flex' },
                flexShrink: 0,
              }}
              aria-label={t('layout.toggleSidebar')}
            >
              {collapsed ? (
                isRtl ? (
                  <ChevronLeftIcon />
                ) : (
                  <ChevronRightIcon />
                )
              ) : isRtl ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                minWidth: 0,
                fontSize: { md: '1rem' },
                maxWidth: { md: 'clamp(100px, 22vw, 260px)' },
              }}
            >
              {pageTitle}
            </Typography>
          </Box>

          {!isMobile ? (
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(520px, 46vw)',
                maxWidth: '100%',
                px: 1,
                zIndex: 3,
              }}
            >
              <GlobalSearchBar />
            </Box>
          ) : null}

          <Box
            sx={{
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.25,
              marginInlineEnd: 1,
              zIndex: 2,
            }}
          >
            {isMobile ? <GlobalSearchBar /> : null}
            <ThemeModeToggle />
            <LanguageSwitcher appBar />
            <UserAppBarMenu />
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 2.5, md: 3 },
          pb: { xs: isMobile ? 10 : 2, sm: isMobile ? 10 : 2.5, md: 3 },
          mt: '64px',
          width: 1,
          maxWidth: '100%',
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
          boxSizing: 'border-box',
        }}
      >
        <Container maxWidth={false} sx={{ width: 1, maxWidth: MAIN_CONTENT_MAX_WIDTH, px: 0 }}>
          {showAnnouncementBanner && (
            <Alert
              severity="info"
              sx={(t) => ({
                mb: 2,
                ...(t.palette.mode === 'dark'
                  ? {
                      bgcolor: alpha(t.palette.info.main, 0.14),
                      color: t.palette.grey[100],
                      border: `1px solid ${alpha(t.palette.info.main, 0.38)}`,
                      '& .MuiAlert-icon': {
                        color: t.palette.info.light,
                      },
                      '& .MuiAlert-message': {
                        color: t.palette.grey[100],
                      },
                      '& .MuiAlert-action .MuiIconButton-root': {
                        color: alpha(t.palette.common.white, 0.85),
                        '&:hover': {
                          bgcolor: alpha(t.palette.common.white, 0.08),
                        },
                      },
                    }
                  : {}),
              })}
              onClose={dismissAnnouncement}
              componentsProps={{
                closeButton: { 'aria-label': t('layout.dismissAnnouncement') },
              }}
            >
              {announcement}
            </Alert>
          )}
          <Outlet />
        </Container>
      </Box>
      {mobileBottomNav}
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'row',
      }}
    >
      <>
        {navColumn}
        {mainColumn}
      </>
    </Box>
  );
};

export default DashboardLayout;
