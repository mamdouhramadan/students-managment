import React from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import TimetableGrid from '../../components/TimetableGrid';
import { useAuth } from '../../hooks/useAuth';
import {
  useTimetableConfig,
  useTimetableConflicts,
  useTimetableDraft,
} from '../../hooks/timetable';
import { useLanguage } from '../../providers/LanguageProvider';

const TimetablePage = () => {
  const { t } = useLanguage();
  const { authUser, isAdmin, isStaff, isStudent } = useAuth();
  const { config, loading } = useTimetableConfig();
  const {
    classLabel,
    courses,
    draft,
    filteredClassGroups,
    gridLoading,
    handleCellChange,
    handlePickClassSave,
    handlePrintStaffTimetable,
    handlePrintStudentTimetable,
    handleSaveGrid,
    pickClassId,
    saving,
    selectedClassId,
    selectedGradeId,
    setPickClassId,
    setSelectedClassId,
    setSelectedGradeId,
    studentClassId,
    teachers,
  } = useTimetableDraft({ authUser, config, isAdmin, isStaff, isStudent });
  const { dayLabelLookup, periodLabelLookup, teacherSlotConflicts } =
    useTimetableConflicts(config);

  if (loading) {
    return (
      <Box>
        <PageHeader title={t('timetablePage.title')} subtitle={t('timetablePage.subtitle')} />
        <Typography color="text.secondary">{t('timetablePage.loading')}</Typography>
      </Box>
    );
  }

  if (!config) {
    return (
      <Box>
        <PageHeader title={t('timetablePage.title')} subtitle={t('timetablePage.subtitle')} />
        <Typography color="error">{t('timetablePage.loadConfigError')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title={t('timetablePage.title')} subtitle={t('timetablePage.subtitle')} />

      {isStaff && teacherSlotConflicts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {t('timetablePage.conflictBanner')}
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {teacherSlotConflicts.slice(0, 8).map((conflict) => (
              <Typography component="li" variant="body2" key={`${conflict.teacherUserId}-${conflict.day}-${conflict.period}`}>
                {t('timetablePage.conflictLine', {
                  teacher: conflict.teacherName,
                  dayLabel: dayLabelLookup[conflict.day] || conflict.day,
                  periodLabel: periodLabelLookup[conflict.period] || String(conflict.period),
                  classes: conflict.classLabels.join('; '),
                })}
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      {isStudent && authUser?.studentId == null && (
        <Typography color="error" sx={{ mb: 2 }}>
          {t('timetablePage.noStudentLink')}
        </Typography>
      )}

      {isStudent && authUser?.studentId != null && !studentClassId && (
        <Stack spacing={2} sx={{ mb: 3, maxWidth: 420 }}>
          <Typography variant="body1">{t('timetablePage.pickClassHint')}</Typography>
          <FormControl fullWidth size="small">
            <InputLabel id="pick-class-label">{t('timetablePage.classGroup')}</InputLabel>
            <Select
              labelId="pick-class-label"
              label={t('timetablePage.classGroup')}
              value={pickClassId}
              onChange={(e) => setPickClassId(e.target.value)}
            >
              <MenuItem value="">
                <em>{t('timetablePage.none')}</em>
              </MenuItem>
              {(config.classGroups || []).map((cg) => (
                <MenuItem key={cg.id} value={String(cg.id)}>
                  {classLabel(cg)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handlePickClassSave}>
            {t('timetablePage.saveClass')}
          </Button>
        </Stack>
      )}

      {isStudent && studentClassId ? (
        <Box sx={{ mb: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle1">{t('timetablePage.yourTimetable')}</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handlePrintStudentTimetable}
              disabled={gridLoading}
            >
              {t('timetablePage.printTimetable')}
            </Button>
          </Stack>
          {gridLoading ? (
            <Typography color="text.secondary">{t('timetablePage.loadingGrid')}</Typography>
          ) : (
            <TimetableGrid
              days={config.days}
              periods={config.periods}
              courses={courses}
              teachers={teachers}
              draft={draft}
              readOnly
            />
          )}
        </Box>
      ) : null}

      {isStaff && (
        <>
          {isAdmin && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <Link component={RouterLink} to="/admin/grades-classes" underline="hover">
                {t('timetablePage.manageGradesLink')}
              </Link>
              {' · '}
              <Link component={RouterLink} to="/admin/courses" underline="hover">
                {t('timetablePage.manageCoursesLink')}
              </Link>
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t('timetablePage.staffPickHint')}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 2, maxWidth: { sm: 720 } }}
          >
            <FormControl fullWidth size="small">
              <InputLabel id="staff-grade">{t('timetablePage.grade')}</InputLabel>
              <Select
                labelId="staff-grade"
                label={t('timetablePage.grade')}
                value={selectedGradeId}
                onChange={(event) => {
                  setSelectedGradeId(event.target.value);
                  setSelectedClassId('');
                }}
              >
                <MenuItem value="">
                  <em>{t('timetablePage.chooseGrade')}</em>
                </MenuItem>
                {(config.grades || []).map((grade) => (
                  <MenuItem key={grade.id} value={String(grade.id)}>
                    {grade.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="staff-section">{t('timetablePage.section')}</InputLabel>
              <Select
                labelId="staff-section"
                label={t('timetablePage.section')}
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
                disabled={!selectedGradeId}
              >
                <MenuItem value="">
                  <em>{t('timetablePage.selectSection')}</em>
                </MenuItem>
                {filteredClassGroups.map((classGroup) => (
                  <MenuItem key={classGroup.id} value={String(classGroup.id)}>
                    {classGroup.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack spacing={2} sx={{ mb: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap">
              <Button
                variant="contained"
                disabled={!selectedClassId || saving || gridLoading}
                onClick={handleSaveGrid}
                sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
              >
                {saving ? t('timetablePage.saving') : t('timetablePage.saveGrid')}
              </Button>
              <Button
                variant="outlined"
                disabled={!selectedClassId || gridLoading}
                onClick={handlePrintStaffTimetable}
              >
                {t('timetablePage.printTimetable')}
              </Button>
            </Stack>
            {!selectedClassId ? (
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', maxWidth: 560 }}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {t('timetablePage.emptySelectionPaper')}
                </Typography>
                {isAdmin && (
                  <Button component={RouterLink} to="/admin/grades-classes" variant="contained">
                    {t('timetablePage.emptySelectionAdminCta')}
                  </Button>
                )}
              </Paper>
            ) : gridLoading ? (
              <Typography color="text.secondary">{t('timetablePage.loadingGrid')}</Typography>
            ) : (
              <TimetableGrid
                days={config.days}
                periods={config.periods}
                courses={courses}
                teachers={teachers}
                draft={draft}
                readOnly={false}
                onCellChange={handleCellChange}
              />
            )}
          </Stack>
        </>
      )}
    </Box>
  );
};

export default TimetablePage;
