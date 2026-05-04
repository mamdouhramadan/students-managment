function escHtml(s) {
  if (s == null || s === '') return '—';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildLookups(courses, teachers) {
  const courseLookupById = new Map();
  (courses || []).forEach((course) => {
    courseLookupById.set(Number(course.id), course);
  });
  const teacherLookupById = new Map();
  (teachers || []).forEach((teacherUser) => {
    teacherLookupById.set(Number(teacherUser.id), teacherUser);
  });
  return { courseLookupById, teacherLookupById };
}

function formatCourseLabel(courseLookupById, courseId, emptyLabel) {
  if (courseId == null) return '';
  const course = courseLookupById.get(courseId);
  if (!course) return escHtml(emptyLabel);
  const name = course.code ? `${course.name} (${course.code})` : course.name;
  return escHtml(name);
}

function formatTeacherLabel(teacherLookupById, teacherUserId, emptyLabel) {
  if (teacherUserId == null) return '';
  const teacherUser = teacherLookupById.get(teacherUserId);
  return escHtml(teacherUser?.name || emptyLabel);
}

/**
 * Print-friendly HTML for the current class timetable (same cell layout as TimetableGrid).
 * @param {object} opts
 * @param {string} opts.classTitle
 * @param {Array} opts.days
 * @param {Array} opts.periods
 * @param {Array} opts.courses
 * @param {Array} opts.teachers
 * @param {Record<string, { courseId?: number|null, teacherUserId?: number|null, room?: string }>} opts.draft
 * @param {Record<string, string>} opts.labels
 */
export function openTimetablePrint({
  classTitle,
  days = [],
  periods = [],
  courses = [],
  teachers = [],
  draft = {},
  labels,
}) {
  const sortedDays = [...days].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const sortedPeriods = [...periods].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const { courseLookupById, teacherLookupById } = buildLookups(courses, teachers);
  const emptySlot = labels?.emptySlot || '—';

  const headerCells = sortedDays
    .map(
      (dayColumn) =>
        `<th scope="col">${escHtml(dayColumn.label || dayColumn.id || '')}</th>`
    )
    .join('');

  const bodyRows = sortedPeriods
    .map((periodRow) => {
      const periodLabel = escHtml(periodRow.label || String(periodRow.order ?? ''));
      const cells = sortedDays
        .map((dayColumn) => {
          const dayId = dayColumn.id;
          const periodOrder = periodRow.order;
          const slotKey = `${dayId}:${periodOrder}`;
          const slotDraft = draft[slotKey] || {};
          const courseIdParsed =
            slotDraft.courseId != null && slotDraft.courseId !== ''
              ? Number(slotDraft.courseId)
              : null;
          const teacherUserIdParsed =
            slotDraft.teacherUserId != null && slotDraft.teacherUserId !== ''
              ? Number(slotDraft.teacherUserId)
              : null;
          const courseId = Number.isFinite(courseIdParsed) ? courseIdParsed : null;
          const teacherUserId = Number.isFinite(teacherUserIdParsed)
            ? teacherUserIdParsed
            : null;
          const room = (slotDraft.room || '').trim();
          const coursePart = formatCourseLabel(courseLookupById, courseId, emptySlot);
          const teacherPart = formatTeacherLabel(teacherLookupById, teacherUserId, emptySlot);
          const roomPart = room ? escHtml(room) : '—';
          return `<td><div class="cell-course">${coursePart}</div><div class="cell-meta">${labels?.teacher || 'Teacher'}: ${teacherPart}</div><div class="cell-meta">${labels?.room || 'Room'}: ${roomPart}</div></td>`;
        })
        .join('');
      return `<tr><th scope="row">${periodLabel}</th>${cells}</tr>`;
    })
    .join('');

  const title = escHtml(classTitle || labels?.docTitle || 'Timetable');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; color: #111; }
    h1 { font-size: 1.25rem; margin-bottom: 16px; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; }
    th, td { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
    th { background: #f5f5f5; }
    .cell-course { font-weight: 600; }
    .cell-meta { font-size: 11px; color: #444; margin-top: 4px; }
    @media print { body { margin: 12px; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <table>
    <thead><tr><th scope="col">${escHtml(labels?.period || 'Period')}</th>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <p style="margin-top:16px;font-size:11px;color:#666;">${escHtml(labels?.footer || '')}</p>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=900');
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 100);
}
