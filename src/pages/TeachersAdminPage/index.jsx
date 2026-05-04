import React from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AppDrawer from '../../components/AppDrawer';
import AppDataTable from '../../components/AppDataTable';
import PageHeader from '../../components/PageHeader';
import { useTeachers } from '../../hooks/teachers';
import { useLanguage } from '../../providers/LanguageProvider';

const TeachersAdminPage = () => {
  const { t } = useLanguage();
  const {
    activeTeacherCount,
    allClassGroups,
    assignedClassGroups,
    assignedClassIdsDraft,
    classGroupLabelById,
    closeDrawer,
    columns,
    drawerOpen,
    loading,
    saveAssignments,
    savingAssignments,
    selectedTeacher,
    selectedTeacherInitials,
    selectedTeacherIsActive,
    setAssignedClassIdsDraft,
    teacherRows,
    timetableLoading,
    timetableRows,
  } = useTeachers();

  if (loading) {
    return (
      <Box>
        <PageHeader title={t('teachersPage.title')} subtitle={t('teachersPage.subtitle')} />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {t('teachersPage.loading')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: 1 }}>
      <PageHeader title={t('teachersPage.title')} subtitle={t('teachersPage.subtitle')} />
      {teacherRows.length > 0 ? (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap" alignItems={{ sm: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('teachersPage.summaryLine', { total: teacherRows.length, active: activeTeacherCount })}
            </Typography>
          </Stack>
        </Box>
      ) : null}
      <AppDataTable
        columns={columns}
        rows={teacherRows}
        getRowId={(teacher) => teacher.id ?? teacher.ID}
        emptyMessage={t('teachersPage.empty')}
        dense={false}
      />

      <AppDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={t('teachersPage.drawerTitle')}
        size="xl"
        footer={
          <>
            <Button color="inherit" variant="outlined" onClick={closeDrawer}>
              {t('drawer.cancel')}
            </Button>
            <Button variant="contained" disabled={savingAssignments} onClick={saveAssignments}>
              {savingAssignments ? t('teachersPage.savingAssignments') : t('teachersPage.saveAssignments')}
            </Button>
          </>
        }
      >
        {selectedTeacher ? (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                alt={selectedTeacher.name || ''}
                src={selectedTeacher.avatarUrl || undefined}
                sx={{ width: 56, height: 56, fontSize: '1.125rem', fontWeight: 700 }}
              >
                {selectedTeacherInitials}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {selectedTeacher.name || t('table.emptyDash')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedTeacher.email || t('table.emptyDash')}
                </Typography>
                <Chip
                  size="small"
                  sx={{ mt: 1 }}
                  color={selectedTeacherIsActive ? 'success' : 'default'}
                  label={
                    selectedTeacherIsActive
                      ? t('teachersPage.statusActive')
                      : t('teachersPage.statusInactive')
                  }
                />
              </Box>
            </Stack>

            <Divider />

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('teachersPage.assignClasses')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
                {t('teachersPage.assignClassesHint')}
              </Typography>
              <Autocomplete
                multiple
                options={allClassGroups}
                value={assignedClassGroups}
                onChange={(_event, selectedClassGroups) => {
                  setAssignedClassIdsDraft(selectedClassGroups.map((classGroup) => Number(classGroup.id)));
                }}
                getOptionLabel={(classGroup) =>
                  classGroupLabelById.get(Number(classGroup.id)) || String(classGroup.name || classGroup.id)
                }
                isOptionEqualToValue={(left, right) => Number(left.id) === Number(right.id)}
                renderInput={(params) => (
                  <TextField {...params} size="small" label={t('teachersPage.assignClasses')} />
                )}
              />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('teachersPage.scheduleTitle')}
              </Typography>
              {!assignedClassIdsDraft.length ? (
                <Typography color="text.secondary">{t('teachersPage.noClassesAssigned')}</Typography>
              ) : timetableLoading ? (
                <Typography color="text.secondary">{t('teachersPage.scheduleLoading')}</Typography>
              ) : !timetableRows.length ? (
                <Typography color="text.secondary">{t('teachersPage.scheduleEmpty')}</Typography>
              ) : (
                <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('teachersPage.colDay')}</TableCell>
                        <TableCell>{t('teachersPage.colPeriod')}</TableCell>
                        <TableCell>{t('teachersPage.colClass')}</TableCell>
                        <TableCell>{t('teachersPage.colCourse')}</TableCell>
                        <TableCell>{t('teachersPage.colRoom')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {timetableRows.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>{t(`timetablePage.day.${row.day}`)}</TableCell>
                          <TableCell>{row.periodLabel}</TableCell>
                          <TableCell>{row.classLabel}</TableCell>
                          <TableCell>{row.courseLabel}</TableCell>
                          <TableCell>{row.room}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Stack>
        ) : (
          <Typography color="text.secondary">{t('teachersPage.loadError')}</Typography>
        )}
      </AppDrawer>
    </Box>
  );
};

export default TeachersAdminPage;
