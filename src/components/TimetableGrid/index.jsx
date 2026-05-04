import React, { useMemo } from 'react';
import {
  Autocomplete,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useLanguage } from '../../providers/LanguageProvider';

/** Stable key for one slot in the draft object: `${dayId}:${periodOrder}` */
function buildSlotKey(dayId, periodOrder) {
  return `${dayId}:${periodOrder}`;
}

/** Default empty slot before user picks course/teacher/room */
function createEmptySlotDraft() {
  return { courseId: null, teacherUserId: null, room: '' };
}

/**
 * Weekly timetable grid: columns = visible weekdays, rows = periods.
 * Staff edit with Autocompletes; students see resolved labels from `courseId` / `teacherUserId`.
 */
export default function TimetableGrid({
  days = [],
  periods = [],
  courses = [],
  teachers = [],
  draft = {},
  readOnly = false,
  onCellChange,
}) {
  const { t } = useLanguage();

  const sortedDayColumns = useMemo(
    () => [...days].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [days]
  );
  const sortedPeriodRows = useMemo(
    () => [...periods].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [periods]
  );

  // Fast lookup when rendering labels and Autocomplete values (id → record)
  const courseLookupById = useMemo(() => {
    const lookup = new Map();
    (courses || []).forEach((course) => {
      lookup.set(Number(course.id), course);
    });
    return lookup;
  }, [courses]);

  const teacherLookupById = useMemo(() => {
    const lookup = new Map();
    (teachers || []).forEach((teacherUser) => {
      lookup.set(Number(teacherUser.id), teacherUser);
    });
    return lookup;
  }, [teachers]);

  /**
   * Normalizes one cell from draft state: ensures numeric ids or null, string room.
   */
  const getNormalizedSlotDraft = (dayId, periodOrder) => {
    const raw = draft[buildSlotKey(dayId, periodOrder)] || createEmptySlotDraft();
    const courseIdParsed =
      raw.courseId != null && raw.courseId !== '' ? Number(raw.courseId) : null;
    const teacherUserIdParsed =
      raw.teacherUserId != null && raw.teacherUserId !== '' ? Number(raw.teacherUserId) : null;
    return {
      courseId: Number.isFinite(courseIdParsed) ? courseIdParsed : null,
      teacherUserId: Number.isFinite(teacherUserIdParsed) ? teacherUserIdParsed : null,
      room: raw.room ?? '',
    };
  };

  const resolveCourseOption = (courseId) =>
    courseId == null ? null : courseLookupById.get(courseId) || null;

  const resolveTeacherOption = (teacherUserId) =>
    teacherUserId == null ? null : teacherLookupById.get(teacherUserId) || null;

  const formatCourseLabel = (courseId) => {
    if (courseId == null) return '';
    const course = courseLookupById.get(courseId);
    if (!course) return t('timetablePage.emptySlot');
    if (course.code) return `${course.name} (${course.code})`;
    return course.name;
  };

  const formatTeacherLabel = (teacherUserId) => {
    if (teacherUserId == null) return '';
    const teacherUser = teacherLookupById.get(teacherUserId);
    return teacherUser?.name || t('timetablePage.emptySlot');
  };

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 520 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 700,
                width: 100,
                position: 'sticky',
                left: 0,
                bgcolor: 'background.paper',
                zIndex: 1,
              }}
            >
              {t('timetablePage.period')}
            </TableCell>
            {sortedDayColumns.map((dayColumn) => (
              <TableCell key={dayColumn.id} align="center" sx={{ fontWeight: 700, minWidth: 160 }}>
                {t(`timetablePage.day.${dayColumn.id}`)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedPeriodRows.map((periodRow) => (
            <TableRow key={periodRow.id}>
              <TableCell
                sx={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  position: 'sticky',
                  left: 0,
                  bgcolor: 'background.paper',
                  zIndex: 1,
                  borderRight: 1,
                  borderColor: 'divider',
                }}
              >
                {periodRow.label || `${t('timetablePage.period')} ${periodRow.order}`}
              </TableCell>
              {sortedDayColumns.map((dayColumn) => {
                const slotDraft = getNormalizedSlotDraft(dayColumn.id, periodRow.order);
                const applySlotPatch = (partial) => {
                  if (readOnly || !onCellChange) return;
                  onCellChange(dayColumn.id, periodRow.order, partial);
                };
                return (
                  <TableCell
                    key={`${dayColumn.id}-${periodRow.order}`}
                    align="left"
                    sx={{ verticalAlign: 'top', p: 1 }}
                  >
                    {readOnly ? (
                      <Box sx={{ py: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCourseLabel(slotDraft.courseId) || t('timetablePage.emptySlot')}
                        </Typography>
                        {slotDraft.teacherUserId ? (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {formatTeacherLabel(slotDraft.teacherUserId)}
                          </Typography>
                        ) : null}
                        {slotDraft.room ? (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {t('timetablePage.room')}: {slotDraft.room}
                          </Typography>
                        ) : null}
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Autocomplete
                          size="small"
                          options={courses || []}
                          value={resolveCourseOption(slotDraft.courseId)}
                          onChange={(_event, selectedCourse) =>
                            applySlotPatch({ courseId: selectedCourse?.id ?? null })
                          }
                          getOptionLabel={(option) =>
                            option?.code ? `${option.name} (${option.code})` : (option?.name ?? '')
                          }
                          isOptionEqualToValue={(optionA, optionB) => optionA?.id === optionB?.id}
                          renderInput={(params) => (
                            <TextField {...params} label={t('timetablePage.course')} />
                          )}
                        />
                        <Autocomplete
                          size="small"
                          options={teachers || []}
                          value={resolveTeacherOption(slotDraft.teacherUserId)}
                          onChange={(_event, selectedTeacher) =>
                            applySlotPatch({ teacherUserId: selectedTeacher?.id ?? null })
                          }
                          getOptionLabel={(option) => option?.name ?? ''}
                          isOptionEqualToValue={(optionA, optionB) => optionA?.id === optionB?.id}
                          renderInput={(params) => (
                            <TextField {...params} label={t('timetablePage.teacher')} />
                          )}
                        />
                        <TextField
                          size="small"
                          fullWidth
                          label={t('timetablePage.room')}
                          value={slotDraft.room}
                          onChange={(event) => applySlotPatch({ room: event.target.value })}
                        />
                      </Box>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
