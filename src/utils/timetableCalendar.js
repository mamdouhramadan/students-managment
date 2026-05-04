/**
 * Client mirror of server/timetableCalendar.js — schedule chips / validation must match GET /api/timetable/config.
 */

export const ALL_DAY_IDS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function parseWeekendDays(raw) {
  if (raw == null || raw === '') return [];
  if (Array.isArray(raw)) {
    return raw
      .map((dayId) => String(dayId).toLowerCase())
      .filter((dayId) => ALL_DAY_IDS.includes(dayId));
  }
  try {
    const parsed = JSON.parse(String(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((dayId) => String(dayId).toLowerCase())
      .filter(
        (dayId, index, allIds) => ALL_DAY_IDS.includes(dayId) && allIds.indexOf(dayId) === index
      );
  } catch {
    return [];
  }
}

export function buildVisibleDays(startDay, weekendDays) {
  const normalizedStart = ALL_DAY_IDS.includes(String(startDay).toLowerCase())
    ? String(startDay).toLowerCase()
    : 'sun';
  const hiddenDayIdSet = new Set(
    (weekendDays || []).slice(0, 3).map((dayId) => String(dayId).toLowerCase())
  );
  const startIndex = ALL_DAY_IDS.indexOf(normalizedStart);
  const rotatedWeek = [...ALL_DAY_IDS.slice(startIndex), ...ALL_DAY_IDS.slice(0, startIndex)];
  const visibleDayIds = rotatedWeek.filter((dayId) => !hiddenDayIdSet.has(dayId));
  return visibleDayIds.map((dayId, columnIndex) => ({ id: dayId, order: columnIndex }));
}

export function getAllowedDayIdSet(startDay, weekendDays) {
  return new Set(buildVisibleDays(startDay, weekendDays).map((day) => day.id));
}
