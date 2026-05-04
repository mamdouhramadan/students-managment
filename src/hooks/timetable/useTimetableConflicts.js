import { useMemo } from 'react';
import { findTeacherSlotConflicts } from '../../utils/timetableConflicts';

export function useTimetableConflicts(config) {
  const teacherSlotConflicts = useMemo(() => {
    if (!config?.timetableCells) return [];
    return findTeacherSlotConflicts(
      config.timetableCells,
      config.classGroups,
      config.grades,
      config.teachers
    );
  }, [config]);

  const dayLabelLookup = useMemo(() => {
    const map = {};
    (config?.days || []).forEach((dayColumn) => {
      map[dayColumn.id] = dayColumn.label || dayColumn.id;
    });
    return map;
  }, [config?.days]);

  const periodLabelLookup = useMemo(() => {
    const map = {};
    (config?.periods || []).forEach((periodRow) => {
      map[periodRow.order] = periodRow.label || String(periodRow.order);
    });
    return map;
  }, [config?.periods]);

  return {
    dayLabelLookup,
    periodLabelLookup,
    teacherSlotConflicts,
  };
}

export default useTimetableConflicts;
