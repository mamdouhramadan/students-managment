/**
 * Detects teachers scheduled in more than one class at the same day+period (read-only check).
 */

function classGroupLabel(classGroupId, classGroups, grades) {
  const cg = (classGroups || []).find((c) => Number(c.id) === Number(classGroupId));
  if (!cg) return `#${classGroupId}`;
  const grade = (grades || []).find((g) => Number(g.id) === Number(cg.gradeId));
  const gradeName = grade?.name || '';
  return gradeName ? `${gradeName} — ${cg.name}` : cg.name;
}

function teacherName(teacherUserId, teachers) {
  const teacherUser = (teachers || []).find((u) => Number(u.id) === Number(teacherUserId));
  return teacherUser?.name || `User #${teacherUserId}`;
}

/**
 * @param {Array} timetableCells
 * @param {Array} classGroups
 * @param {Array} grades
 * @param {Array} teachers
 * @returns {Array<{ teacherUserId: number, day: string, period: number, classLabels: string[] }>}
 */
export function findTeacherSlotConflicts(timetableCells, classGroups, grades, teachers) {
  const byKey = new Map();
  for (const cell of timetableCells || []) {
    const teacherUserId = cell.teacherUserId;
    if (teacherUserId == null || teacherUserId === '') continue;
    const day = cell.day;
    const period = cell.period;
    const key = `${Number(teacherUserId)}:${day}:${period}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(cell);
  }

  const conflicts = [];
  for (const [, cells] of byKey) {
    if (cells.length < 2) continue;
    const classIds = new Set(cells.map((c) => Number(c.classGroupId)));
    if (classIds.size <= 1) continue;
    const first = cells[0];
    const classLabels = [...classIds].map((id) =>
      classGroupLabel(id, classGroups, grades)
    );
    conflicts.push({
      teacherUserId: Number(first.teacherUserId),
      day: first.day,
      period: first.period,
      classLabels,
    });
  }
  return conflicts.map((c) => ({
    ...c,
    teacherName: teacherName(c.teacherUserId, teachers),
  }));
}
