const STORAGE_KEY = 'stroika_recent_student_ids';
const MAX_RECENT = 5;

function parseStoredIds(raw) {
  if (!raw || typeof raw !== 'string') return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);
  } catch {
    return [];
  }
}

/** Remember last opened student profile (most recent first). */
export function pushRecentStudentId(studentId) {
  const id = Number(studentId);
  if (!Number.isFinite(id) || id < 1) return;
  let existing = [];
  try {
    existing = parseStoredIds(localStorage.getItem(STORAGE_KEY));
  } catch {
    existing = [];
  }
  const next = [id, ...existing.filter((x) => x !== id)].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function readRecentStudentIds() {
  try {
    return parseStoredIds(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

/**
 * Map ordered ids to student rows from a list (preserves order, skips missing).
 */
export function resolveRecentStudents(orderedIds, students) {
  if (!orderedIds.length || !Array.isArray(students)) return [];
  const byId = new Map(students.map((student) => [student.id ?? student.ID, student]));
  const out = [];
  for (const id of orderedIds) {
    const row = byId.get(id);
    if (row) out.push(row);
  }
  return out;
}
