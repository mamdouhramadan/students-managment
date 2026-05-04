import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  getAdminUsers,
  getTimetableConfig,
  getTimetableForClass,
  patchAdminUser,
} from '../../api/api';
import { withLegacyId } from '../../api/normalize';
import ShowToast from '../../components/ShowToast';
import { useLanguage } from '../../providers/LanguageProvider';

const WEEK_DAY_ORDER = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function initialsFromDisplayName(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isTeacherRowActive(teacher) {
  return teacher.active !== false;
}

export function useTeachers() {
  const { t } = useLanguage();
  const [allUsers, setAllUsers] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [assignedClassIdsDraft, setAssignedClassIdsDraft] = useState([]);
  const [timetableRows, setTimetableRows] = useState([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [savingAssignments, setSavingAssignments] = useState(false);

  const teacherRows = useMemo(
    () => (allUsers || []).filter((user) => (user.role || '').toLowerCase() === 'teacher'),
    [allUsers]
  );

  const selectedTeacher = useMemo(
    () =>
      teacherRows.find(
        (teacher) => Number(teacher.id ?? teacher.ID) === Number(selectedTeacherId)
      ) || null,
    [selectedTeacherId, teacherRows]
  );

  const classGroupLabelById = useMemo(() => {
    const labelByClassGroupId = new Map();
    const gradesById = new Map((config?.grades || []).map((grade) => [Number(grade.id), grade]));
    (config?.classGroups || []).forEach((classGroup) => {
      const grade = gradesById.get(Number(classGroup.gradeId));
      const label = grade?.name ? `${grade.name} - ${classGroup.name}` : classGroup.name;
      labelByClassGroupId.set(Number(classGroup.id), label);
    });
    return labelByClassGroupId;
  }, [config]);

  const allClassGroups = useMemo(() => config?.classGroups || [], [config]);

  const classGroupById = useMemo(() => {
    const map = new Map();
    allClassGroups.forEach((classGroup) => map.set(Number(classGroup.id), classGroup));
    return map;
  }, [allClassGroups]);

  const gradeNameById = useMemo(() => {
    const map = new Map();
    (config?.grades || []).forEach((grade) => map.set(Number(grade.id), grade.name || ''));
    return map;
  }, [config]);

  const activeTeacherCount = useMemo(
    () => teacherRows.filter((teacher) => isTeacherRowActive(teacher)).length,
    [teacherRows]
  );

  const days = useMemo(() => config?.days || [], [config]);
  const periods = useMemo(() => config?.periods || [], [config]);
  const courses = useMemo(() => config?.courses || [], [config]);

  const assignedClassGroups = useMemo(() => {
    const assignedSet = new Set((assignedClassIdsDraft || []).map((value) => Number(value)));
    return allClassGroups.filter((classGroup) => assignedSet.has(Number(classGroup.id)));
  }, [allClassGroups, assignedClassIdsDraft]);

  const loadData = useCallback(() => {
    return Promise.all([getAdminUsers(), getTimetableConfig()])
      .then(([usersResponse, configResponse]) => {
        setAllUsers((usersResponse.data || []).map(withLegacyId));
        setConfig(configResponse.data || null);
      })
      .catch((error) => {
        ShowToast('error', error?.response?.data?.message || t('teachersPage.loadError'));
      });
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadData().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  const openTeacherDetails = useCallback((teacher) => {
    const teacherId = Number(teacher.id ?? teacher.ID);
    const teacherClassGroupIds = Array.isArray(teacher.teacherClassGroupIds)
      ? teacher.teacherClassGroupIds.map((id) => Number(id))
      : [];
    setSelectedTeacherId(teacherId);
    setAssignedClassIdsDraft(teacherClassGroupIds);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedTeacherId(null);
    setAssignedClassIdsDraft([]);
    setTimetableRows([]);
  }, []);

  const loadTeacherTimetable = useCallback(
    (teacherId, classIds) => {
      if (!teacherId || !classIds.length) {
        setTimetableRows([]);
        return;
      }

      const dayOrderById = new Map(
        days.map((day, index) => [day.id, day.order != null ? Number(day.order) : index + 1])
      );
      const periodLabelByOrder = new Map(
        periods.map((period) => [
          Number(period.order),
          period.label || `${t('timetablePage.period')} ${period.order}`,
        ])
      );
      const courseById = new Map(courses.map((course) => [Number(course.id), course]));

      setTimetableLoading(true);
      Promise.all(classIds.map((classId) => getTimetableForClass(Number(classId))))
        .then((responses) => {
          const nextRows = [];
          responses.forEach((response, responseIndex) => {
            const classId = Number(classIds[responseIndex]);
            const classLabel = classGroupLabelById.get(classId) || String(classId);
            const classCells = response.data?.cells || [];
            classCells.forEach((cell) => {
              if (Number(cell.teacherUserId) !== Number(teacherId)) return;
              const periodOrder = Number(cell.period);
              const course = courseById.get(Number(cell.courseId));
              nextRows.push({
                id: `${classId}-${cell.day}-${cell.period}-${cell.id ?? 'slot'}`,
                day: cell.day,
                dayOrder:
                  dayOrderById.get(cell.day) != null
                    ? Number(dayOrderById.get(cell.day))
                    : WEEK_DAY_ORDER.indexOf(cell.day),
                periodOrder,
                periodLabel:
                  periodLabelByOrder.get(periodOrder) ||
                  `${t('timetablePage.period')} ${periodOrder}`,
                classLabel,
                courseLabel: course?.name || t('timetablePage.emptySlot'),
                room: cell.room || t('table.emptyDash'),
              });
            });
          });
          nextRows.sort((left, right) => {
            const dayDiff = left.dayOrder - right.dayOrder;
            if (dayDiff !== 0) return dayDiff;
            return left.periodOrder - right.periodOrder;
          });
          setTimetableRows(nextRows);
        })
        .catch((error) => {
          ShowToast(
            'error',
            error?.response?.data?.message || t('teachersPage.scheduleLoadError')
          );
          setTimetableRows([]);
        })
        .finally(() => setTimetableLoading(false));
    },
    [classGroupLabelById, courses, days, periods, t]
  );

  useEffect(() => {
    if (!drawerOpen || !selectedTeacherId) return;
    loadTeacherTimetable(selectedTeacherId, assignedClassIdsDraft);
  }, [assignedClassIdsDraft, drawerOpen, loadTeacherTimetable, selectedTeacherId]);

  const saveAssignments = useCallback(() => {
    if (!selectedTeacher) return;
    const teacherId = selectedTeacher.id ?? selectedTeacher.ID;
    setSavingAssignments(true);
    patchAdminUser(teacherId, { teacherClassGroupIds: assignedClassIdsDraft })
      .then(() => {
        ShowToast('success', t('teachersPage.assignmentsSaved'));
        return loadData();
      })
      .catch((error) => {
        ShowToast('error', error?.response?.data?.message || t('teachersPage.saveError'));
      })
      .finally(() => setSavingAssignments(false));
  }, [assignedClassIdsDraft, loadData, selectedTeacher, t]);

  const gradeNamesForTeacher = useCallback(
    (teacher) => {
      const classIds = Array.isArray(teacher.teacherClassGroupIds)
        ? teacher.teacherClassGroupIds
        : [];
      const gradeIdSet = new Set();
      classIds.forEach((rawId) => {
        const classGroup = classGroupById.get(Number(rawId));
        if (classGroup) gradeIdSet.add(Number(classGroup.gradeId));
      });
      return [...gradeIdSet]
        .map((gradeId) => gradeNameById.get(gradeId))
        .filter(Boolean)
        .sort((left, right) =>
          String(left).localeCompare(String(right), undefined, { sensitivity: 'base' })
        );
    },
    [classGroupById, gradeNameById]
  );

  const columns = useMemo(() => {
    return [
      {
        id: 'teacher',
        label: t('teachersPage.colTeacher'),
        render: (teacher) => {
          const displayName = teacher.name || t('table.emptyDash');
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                alt={displayName}
                src={teacher.avatarUrl || undefined}
                sx={{ width: 40, height: 40, fontSize: '0.875rem', fontWeight: 600 }}
              >
                {initialsFromDisplayName(teacher.name)}
              </Avatar>
              <Typography variant="body2" fontWeight={600}>
                {displayName}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'email',
        label: t('table.email'),
        render: (teacher) => (
          <Typography variant="body2" color="text.secondary">
            {teacher.email || t('table.emptyDash')}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: t('teachersPage.colStatus'),
        render: (teacher) => (
          <Chip
            size="small"
            color={isTeacherRowActive(teacher) ? 'success' : 'default'}
            variant={isTeacherRowActive(teacher) ? 'filled' : 'outlined'}
            label={
              isTeacherRowActive(teacher)
                ? t('teachersPage.statusActive')
                : t('teachersPage.statusInactive')
            }
          />
        ),
      },
      {
        id: 'sections',
        label: t('teachersPage.colSections'),
        render: (teacher) => {
          const classIds = Array.isArray(teacher.teacherClassGroupIds)
            ? teacher.teacherClassGroupIds
            : [];
          return (
            <Typography variant="body2" fontWeight={500}>
              {t('teachersPage.sectionsCount', { count: classIds.length })}
            </Typography>
          );
        },
      },
      {
        id: 'grades',
        label: t('teachersPage.colGrades'),
        render: (teacher) => {
          const names = gradeNamesForTeacher(teacher);
          if (!names.length) {
            return <Typography color="text.secondary">{t('teachersPage.noGradesYet')}</Typography>;
          }
          return (
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
              {names.join(t('teachersPage.gradeNameSeparator'))}
            </Typography>
          );
        },
      },
      {
        id: 'assignedClasses',
        label: t('teachersPage.assignedClasses'),
        render: (teacher) => {
          const classIds = Array.isArray(teacher.teacherClassGroupIds)
            ? teacher.teacherClassGroupIds
            : [];
          if (!classIds.length) return t('teachersPage.noClassesAssigned');
          return (
            <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
              {classIds.slice(0, 2).map((classId) => (
                <Chip
                  key={`${teacher.id}-assigned-${classId}`}
                  size="small"
                  variant="outlined"
                  label={classGroupLabelById.get(Number(classId)) || classId}
                />
              ))}
              {classIds.length > 2 ? (
                <Chip
                  size="small"
                  variant="outlined"
                  label={t('teachersPage.moreSections', { count: classIds.length - 2 })}
                />
              ) : null}
            </Stack>
          );
        },
      },
      {
        id: 'actions',
        label: t('table.actions'),
        align: 'end',
        render: (teacher) => (
          <Box sx={{ display: 'flex', justifyContent: 'end', width: '100%' }}>
            <IconButton
              size="small"
              onClick={() => openTeacherDetails(teacher)}
              aria-label={t('teachersPage.viewDetails')}
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ];
  }, [classGroupLabelById, gradeNamesForTeacher, openTeacherDetails, t]);

  return {
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
    selectedTeacherInitials: initialsFromDisplayName(selectedTeacher?.name),
    selectedTeacherIsActive: isTeacherRowActive(selectedTeacher || {}),
    setAssignedClassIdsDraft,
    teacherRows,
    timetableLoading,
    timetableRows,
  };
}

export default useTeachers;
