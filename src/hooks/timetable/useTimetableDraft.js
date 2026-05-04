import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getSingleStudent,
  getTimetableForClass,
  patchMyClassGroup,
  putTimetableForClass,
} from '../../api/api';
import ShowToast from '../../components/ShowToast';
import { useLanguage } from '../../providers/LanguageProvider';
import { openTimetablePrint } from '../../utils/printTimetable';

function createEmptySlotDraft() {
  return { courseId: null, teacherUserId: null, room: '' };
}

function timetableCellsToSlotDraftMap(timetableCells) {
  const slotDraftByKey = {};
  (timetableCells || []).forEach((cell) => {
    const slotKey = `${cell.day}:${cell.period}`;
    slotDraftByKey[slotKey] = {
      courseId: cell.courseId != null && cell.courseId !== '' ? Number(cell.courseId) : null,
      teacherUserId:
        cell.teacherUserId != null && cell.teacherUserId !== ''
          ? Number(cell.teacherUserId)
          : null,
      room: cell.room ?? '',
    };
  });
  return slotDraftByKey;
}

function slotDraftMapToSaveEntries(slotDraftMap, visibleDays, periodDefinitions) {
  const entries = [];
  for (const dayColumn of visibleDays) {
    for (const periodRow of periodDefinitions) {
      const slotKey = `${dayColumn.id}:${periodRow.order}`;
      const slotDraft = slotDraftMap[slotKey] || createEmptySlotDraft();
      const courseId =
        slotDraft.courseId != null && slotDraft.courseId !== ''
          ? Number(slotDraft.courseId)
          : null;
      const teacherUserId =
        slotDraft.teacherUserId != null && slotDraft.teacherUserId !== ''
          ? Number(slotDraft.teacherUserId)
          : null;
      const roomTrimmed = (slotDraft.room || '').trim();
      if (courseId || teacherUserId || roomTrimmed) {
        const payloadRow = { day: dayColumn.id, period: periodRow.order };
        if (courseId) payloadRow.courseId = courseId;
        if (teacherUserId) payloadRow.teacherUserId = teacherUserId;
        if (roomTrimmed) payloadRow.room = roomTrimmed;
        entries.push(payloadRow);
      }
    }
  }
  return entries;
}

export function useTimetableDraft({ authUser, config, isAdmin, isStaff, isStudent }) {
  const { t } = useLanguage();
  const [studentClassId, setStudentClassId] = useState(null);
  const [pickClassId, setPickClassId] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [draft, setDraft] = useState({});
  const [gridLoading, setGridLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isStudent || authUser?.studentId == null) return;
    let cancelled = false;
    getSingleStudent(authUser.studentId)
      .then((response) => {
        if (cancelled) return;
        const classGroupId = response.data?.classGroupId;
        setStudentClassId(
          classGroupId != null && classGroupId !== '' ? Number(classGroupId) : null
        );
        setPickClassId(
          classGroupId != null && classGroupId !== '' ? String(classGroupId) : ''
        );
      })
      .catch(() => {
        if (!cancelled) ShowToast('error', t('timetablePage.loadStudentError'));
      });
    return () => {
      cancelled = true;
    };
  }, [authUser?.studentId, isStudent, t]);

  const filteredClassGroups = useMemo(() => {
    const list = config?.classGroups || [];
    if (!selectedGradeId) return [];
    const gradeId = Number(selectedGradeId);
    return list.filter((classGroup) => Number(classGroup.gradeId) === gradeId);
  }, [config?.classGroups, selectedGradeId]);

  useEffect(() => {
    if (!isStaff || !selectedClassId) {
      if (isStaff) setDraft({});
      return;
    }

    let cancelled = false;
    setGridLoading(true);
    getTimetableForClass(Number(selectedClassId))
      .then((response) => {
        if (cancelled) return;
        setDraft(timetableCellsToSlotDraftMap(response.data?.cells));
      })
      .catch((error) => {
        if (!cancelled) {
          ShowToast(
            'error',
            error?.response?.data?.message || t('timetablePage.loadGridError')
          );
          setDraft({});
        }
      })
      .finally(() => {
        if (!cancelled) setGridLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isStaff, selectedClassId, t]);

  useEffect(() => {
    if (!isStudent || !studentClassId) {
      if (isStudent) setDraft({});
      return;
    }

    let cancelled = false;
    setGridLoading(true);
    getTimetableForClass(studentClassId)
      .then((response) => {
        if (cancelled) return;
        setDraft(timetableCellsToSlotDraftMap(response.data?.cells));
      })
      .catch((error) => {
        if (!cancelled) {
          ShowToast(
            'error',
            error?.response?.data?.message || t('timetablePage.loadGridError')
          );
          setDraft({});
        }
      })
      .finally(() => {
        if (!cancelled) setGridLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isStudent, studentClassId, t]);

  const handleCellChange = useCallback((day, period, patch) => {
    const slotKey = `${day}:${period}`;
    setDraft((previousDraft) => ({
      ...previousDraft,
      [slotKey]: { ...createEmptySlotDraft(), ...(previousDraft[slotKey] || {}), ...patch },
    }));
  }, []);

  const handleSaveGrid = useCallback(() => {
    if (!selectedClassId || !config) return;

    const visibleDays = config.days || [];
    const periodDefinitions = [...(config.periods || [])].sort(
      (left, right) => (left.order ?? 0) - (right.order ?? 0)
    );
    const entries = slotDraftMapToSaveEntries(draft, visibleDays, periodDefinitions);
    setSaving(true);
    putTimetableForClass(Number(selectedClassId), { entries })
      .then((response) => {
        setDraft(timetableCellsToSlotDraftMap(response.data?.cells));
        ShowToast('success', t('timetablePage.saved'));
      })
      .catch((error) => {
        ShowToast('error', error?.response?.data?.message || t('timetablePage.saveError'));
      })
      .finally(() => setSaving(false));
  }, [config, draft, selectedClassId, t]);

  const handlePickClassSave = useCallback(() => {
    const rawClassId = pickClassId === '' ? null : Number(pickClassId);
    if (rawClassId != null && !Number.isFinite(rawClassId)) {
      ShowToast('error', t('timetablePage.pickClassInvalid'));
      return;
    }

    patchMyClassGroup({ classGroupId: rawClassId })
      .then((response) => {
        const classGroupId = response.data?.classGroupId;
        setStudentClassId(classGroupId != null ? Number(classGroupId) : null);
        ShowToast('success', t('timetablePage.classSaved'));
      })
      .catch((error) => {
        ShowToast(
          'error',
          error?.response?.data?.message || t('timetablePage.classSaveError')
        );
      });
  }, [pickClassId, t]);

  const classLabel = useCallback(
    (classGroup) => {
      const grade = (config?.grades || []).find(
        (gradeRow) => Number(gradeRow.id) === Number(classGroup.gradeId)
      );
      const gradeName = grade?.name || '';
      return gradeName ? `${gradeName} — ${classGroup.name}` : classGroup.name;
    },
    [config?.grades]
  );

  const selectedClassGroup = useMemo(() => {
    if (!selectedClassId) return null;
    return (
      (config?.classGroups || []).find(
        (classGroup) => String(classGroup.id) === String(selectedClassId)
      ) || null
    );
  }, [config?.classGroups, selectedClassId]);

  const studentClassGroup = useMemo(() => {
    if (!studentClassId) return null;
    return (
      (config?.classGroups || []).find(
        (classGroup) => Number(classGroup.id) === Number(studentClassId)
      ) || null
    );
  }, [config?.classGroups, studentClassId]);

  const printLabels = useMemo(
    () => ({
      period: t('timetablePage.period'),
      teacher: t('timetablePage.teacher'),
      room: t('timetablePage.room'),
      emptySlot: t('timetablePage.emptySlot'),
      footer: t('timetablePage.printFooter'),
      docTitle: t('timetablePage.title'),
    }),
    [t]
  );

  const handlePrintStaffTimetable = useCallback(() => {
    if (!selectedClassGroup || !config) return;
    openTimetablePrint({
      classTitle: classLabel(selectedClassGroup),
      days: config.days,
      periods: config.periods,
      courses: config.courses || [],
      teachers: config.teachers || [],
      draft,
      labels: printLabels,
    });
  }, [classLabel, config, draft, printLabels, selectedClassGroup]);

  const handlePrintStudentTimetable = useCallback(() => {
    if (!studentClassGroup || !config) return;
    openTimetablePrint({
      classTitle: classLabel(studentClassGroup),
      days: config.days,
      periods: config.periods,
      courses: config.courses || [],
      teachers: config.teachers || [],
      draft,
      labels: printLabels,
    });
  }, [classLabel, config, draft, printLabels, studentClassGroup]);

  return {
    classLabel,
    courses: config?.courses || [],
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
    selectedClassGroup,
    selectedClassId,
    selectedGradeId,
    setPickClassId,
    setSelectedClassId,
    setSelectedGradeId,
    studentClassGroup,
    studentClassId,
    teachers: config?.teachers || [],
  };
}

export default useTimetableDraft;
