/** Escape and quote a CSV cell per RFC-style rules */
function escapeCsvCell(val) {
  const s = val == null ? '' : String(val);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const STUDENT_COLUMNS = [
  'id',
  'firstName',
  'lastName',
  'email',
  'dateOfBirth',
  'nationalityId',
  'address',
  'eid',
  'notes',
  'classGroupId',
  'active',
  'tagIds',
  'createdAt',
  'updatedAt',
];

/**
 * @param {Array<Record<string, unknown>>} rows
 * @param {string} filename
 */
export function downloadStudentsCsv(rows, filename) {
  const header = STUDENT_COLUMNS.join(',');
  const lines = rows.map((row) => {
    const id = row.id ?? row.ID;
    const nationalityId = row.nationalityId ?? '';
    const classGroupId =
      row.classGroupId !== undefined && row.classGroupId !== null ? row.classGroupId : '';
    const tagIds = Array.isArray(row.tagIds) ? JSON.stringify(row.tagIds) : '';
    const cells = [
      id,
      row.firstName,
      row.lastName,
      row.email,
      row.dateOfBirth,
      nationalityId,
      row.address,
      row.eid,
      row.notes,
      classGroupId,
      row.active === false ? 'false' : 'true',
      tagIds,
      row.createdAt ?? '',
      row.updatedAt ?? '',
    ];
    return cells.map(escapeCsvCell).join(',');
  });
  const bom = '\uFEFF';
  const csv = bom + [header, ...lines].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const PARENT_COLUMNS = [
  'id',
  'firstName',
  'lastName',
  'email',
  'phone',
  'studentId',
  'relationship',
];

/**
 * @param {Array<Record<string, unknown>>} rows
 * @param {string} filename
 */
export function downloadParentsCsv(rows, filename) {
  const header = PARENT_COLUMNS.join(',');
  const lines = rows.map((row) => {
    const cells = [
      row.id ?? row.ID,
      row.firstName,
      row.lastName,
      row.email,
      row.phone,
      row.studentId,
      row.relationship,
    ];
    return cells.map(escapeCsvCell).join(',');
  });
  const bom = '\uFEFF';
  const csv = bom + [header, ...lines].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
