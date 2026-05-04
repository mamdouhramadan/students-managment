import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PeopleIcon from '@mui/icons-material/People';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import moment from 'moment';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../providers/LanguageProvider';
import ReportStatCard from '../../components/ReportStatCard';
import PageHeader from '../../components/PageHeader';
import AdminReportsBlock from './AdminReportsBlock';
import {
  useStatistics,
  useReports,
  useBirthdays,
  useRecentStudents,
} from '../../hooks/home';

const HomePage = () => {
  const navigate = useNavigate();
  const { authUser, isAdmin, isStaff, isStudent } = useAuth();
  const { t } = useLanguage();

  const { stats, homeStudents } = useStatistics();
  const { adminSnapshot } = useReports(t);
  const { birthdaysThisMonth } = useBirthdays(homeStudents);
  const { recentStudentRows } = useRecentStudents(homeStudents);

  const displayName = authUser?.name || authUser?.email || '';
  const showStudentWidgets = isAdmin || isStaff || isStudent;

  const sidebarStack = showStudentWidgets ? (
    <Stack spacing={2} sx={{ width: 1 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <CakeOutlinedIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={600}>
            {t('home.birthdaysThisMonth')}
          </Typography>
        </Stack>
        {birthdaysThisMonth.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('home.noBirthdaysThisMonth')}
          </Typography>
        ) : (
          <Stack spacing={1}>
            {birthdaysThisMonth.map((student) => {
              const sid = student.id ?? student.ID;
              const name =
                `${student.firstName || ''} ${student.lastName || ''}`.trim() || '—';
              const dayLabel = moment(student.dateOfBirth).format('MMM D');
              return (
                <Typography key={sid} variant="body2">
                  <strong>{dayLabel}</strong>
                  {' — '}
                  {name}
                </Typography>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <HistoryOutlinedIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={600}>
            {t('home.recentStudents')}
          </Typography>
        </Stack>
        {recentStudentRows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('home.recentStudentsEmpty')}
          </Typography>
        ) : (
          <Stack spacing={1}>
            {recentStudentRows.map((student) => {
              const sid = student.id ?? student.ID;
              const name =
                `${student.firstName || ''} ${student.lastName || ''}`.trim() || '—';
              return (
                <Chip
                  key={sid}
                  label={name}
                  size="small"
                  onClick={() => navigate(`/students?openStudent=${sid}`)}
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start' }}
                />
              );
            })}
          </Stack>
        )}
      </Paper>

      <Divider />

      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
        {t('home.sidebarShortcuts')}
      </Typography>
      <Stack spacing={1} sx={{ width: 1 }}>
        <Button
          fullWidth
          variant="contained"
          size="small"
          startIcon={<SchoolIcon />}
          onClick={() => navigate('/students')}
        >
          {t('nav.students')}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<FamilyRestroomIcon />}
          onClick={() => navigate('/parents')}
        >
          {t('nav.parents')}
        </Button>
        {isStaff && (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<EventNoteIcon />}
            onClick={() => navigate('/timetable')}
          >
            {t('nav.timetable')}
          </Button>
        )}
        {isStaff && (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<TaskAltOutlined />}
            onClick={() => navigate('/reminders')}
          >
            {t('nav.reminders')}
          </Button>
        )}
        {isAdmin && (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<PeopleIcon />}
            onClick={() => navigate('/admin/users')}
          >
            {t('nav.users')}
          </Button>
        )}
        {isAdmin && (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/admin/settings')}
          >
            {t('nav.settings')}
          </Button>
        )}
        {isAdmin && (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<AccountTreeIcon />}
            onClick={() => navigate('/admin/grades-classes')}
          >
            {t('nav.gradesClasses')}
          </Button>
        )}
        {isAdmin && (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<MenuBookIcon />}
            onClick={() => navigate('/admin/courses')}
          >
            {t('nav.courses')}
          </Button>
        )}
      </Stack>
    </Stack>
  ) : null;

  const mainColumn = (
    <Box sx={{ flex: { md: '3 1 0%' }, minWidth: 0, width: { xs: '100%' } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          background: (th) =>
            `linear-gradient(125deg, ${th.palette.primary.dark} 0%, ${th.palette.primary.main} 55%, ${th.palette.secondary?.main || th.palette.primary.light} 100%)`,
          color: 'primary.contrastText',
          borderRadius: 2,
          boxShadow: (th) => th.shadows[4],
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 1.2 }}>
          {t('home.dashboard')}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
          {t('home.welcome', { name: displayName })}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1.5, opacity: 0.95, maxWidth: 640 }}>
          {t('home.signedInAs')} <strong>{authUser?.role}</strong>.{' '}
          {isAdmin ? t('home.adminBlurb') : t('home.userBlurb')}
        </Typography>
      </Paper>

      {isAdmin ? (
        <>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'text.secondary' }}>
            {t('home.reportsSection')}
          </Typography>
          <AdminReportsBlock data={adminSnapshot} t={t} />
        </>
      ) : (
        <>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'text.secondary' }}>
            {t('home.overview')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <ReportStatCard
                icon={SchoolIcon}
                label={t('home.statStudents')}
                value={stats.students}
                color="primary"
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <ReportStatCard
                icon={FamilyRestroomIcon}
                label={t('home.statParents')}
                value={stats.parents}
                color="info"
              />
            </Box>
          </Stack>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ width: 1 }}>
      <PageHeader title={t('home.title')} subtitle={t('home.subtitle')} />

      {showStudentWidgets ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2.5, md: 3 },
            alignItems: 'flex-start',
          }}
        >
          {mainColumn}
          <Box
            sx={{
              flex: { md: '1 1 0%' },
              width: { xs: '100%', md: '25%' },
              minWidth: { md: 0 },
              maxWidth: { md: 320 },
              position: { md: 'sticky' },
              top: { md: 16 },
              alignSelf: { md: 'flex-start' },
            }}
          >
            {sidebarStack}
          </Box>
        </Box>
      ) : (
        mainColumn
      )}
    </Box>
  );
};

export default HomePage;
