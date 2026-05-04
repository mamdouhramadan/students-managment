import React, { useMemo } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import PublicIcon from '@mui/icons-material/Public';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import ReportStatCard from '../../components/ReportStatCard';

const CHART_HEIGHT = 300;

/**
 * Full admin reports: summary cards + charts (formerly the standalone Reports page).
 */
export default function AdminReportsBlock({ data, t }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const charts = useMemo(() => {
    if (!data) return null;
    const { users, records } = data;
    const roleBars = [
      { name: t('reports.chartTeachers'), count: users.teachers },
      { name: t('reports.chartStudentAccounts'), count: users.students },
      { name: t('reports.chartAdmins'), count: users.admins },
    ];
    const activePie = [
      { name: t('reports.chartActive'), value: users.active, color: theme.palette.success.main },
      { name: t('reports.chartInactive'), value: users.inactive, color: theme.palette.error.light },
    ].filter((d) => d.value > 0);
    const recordBars = [
      { name: t('reports.chartStudentRecords'), count: records.students },
      { name: t('reports.chartParents'), count: records.parents },
      { name: t('reports.chartFamilyMembers'), count: records.familyMembers },
      { name: t('reports.chartNationalities'), count: records.nationalities },
    ];
    return { roleBars, activePie, recordBars };
  }, [data, theme.palette.success.main, theme.palette.error.light, t]);

  if (!data || !charts) {
    return (
      <Typography color="text.secondary" variant="body2">
        {t('reports.loading')}
      </Typography>
    );
  }

  const { users, records } = data;

  return (
    <Box sx={{ width: 1 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
        {t('reports.summary')}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <ReportStatCard
            icon={GroupIcon}
            label={t('home.statTotalUsers')}
            value={users.total}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ReportStatCard
            icon={SchoolIcon}
            label={t('home.statTeachers')}
            value={users.teachers}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ReportStatCard
            icon={PersonIcon}
            label={t('home.statStudentAccounts')}
            value={users.students}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ReportStatCard
            icon={AdminPanelSettingsIcon}
            label={t('home.statAdmins')}
            value={users.admins}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ReportStatCard
            icon={CheckCircleOutlineIcon}
            label={t('home.statActiveAccounts')}
            value={users.active}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ReportStatCard
            icon={BlockIcon}
            label={t('reports.inactiveAccounts')}
            value={users.inactive}
            color="error"
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
        {t('reports.dataRecords')}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard
            icon={SchoolIcon}
            label={t('home.statStudentRecords')}
            value={records.students}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard
            icon={FamilyRestroomIcon}
            label={t('home.statParents')}
            value={records.parents}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard
            icon={Diversity3Icon}
            label={t('home.statFamilyMembers')}
            value={records.familyMembers}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReportStatCard
            icon={PublicIcon}
            label={t('reports.nationalities')}
            value={records.nationalities}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: alpha(primary, 0.03),
              borderColor: alpha(primary, 0.12),
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              {t('reports.accountsByRole')}
            </Typography>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={charts.roleBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.8)} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} width={40} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name={t('reports.countLabel')}
                  fill={primary}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.success.main, 0.04),
              borderColor: alpha(theme.palette.success.main, 0.15),
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              {t('reports.activeVsInactive')}
            </Typography>
            {charts.activePie.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                {t('reports.noData')}
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <PieChart>
                  <Pie
                    data={charts.activePie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {charts.activePie.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.info.main, 0.04),
              borderColor: alpha(theme.palette.info.main, 0.12),
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              {t('reports.recordsVolume')}
            </Typography>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart
                data={charts.recordBars}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.8)} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name={t('reports.countLabel')}
                  fill={theme.palette.info.main}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
