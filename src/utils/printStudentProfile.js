function escHtml(s) {
  if (s == null || s === '') return '—';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fullName(row) {
  const a = (row?.firstName || '').trim();
  const b = (row?.lastName || '').trim();
  const n = `${a} ${b}`.trim();
  return n || '—';
}

/**
 * Opens a minimal print window with student profile HTML (no MUI / drawer chrome).
 * @param {object} opts
 * @param {Record<string, unknown>} opts.data – student.data from modal store
 * @param {Array} opts.parents
 * @param {Array} opts.familyMembers
 * @param {Record<string, string>} opts.labels – pre-translated strings
 */
export function openStudentPrintProfile({ data, parents, familyMembers, labels }) {
  if (!data || typeof data !== 'object') return;
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1200');
  if (!w) return;

  const natTitle =
    data.nationality && typeof data.nationality === 'object'
      ? data.nationality.Title ?? data.nationality.title
      : '';

  const rows = [
    [labels.fullName, escHtml(fullName(data))],
    [labels.dob, escHtml(data.dateOfBirth)],
    [labels.nationality, escHtml(natTitle)],
    [labels.address, escHtml(data.address)],
    [labels.eid, escHtml(data.eid)],
    [labels.email, escHtml(data.email)],
    [labels.notes, escHtml(data.notes)],
  ];

  const studentRowsHtml = rows
    .map(
      ([k, v]) =>
        `<tr><th scope="row">${escHtml(k)}</th><td>${v}</td></tr>`
    )
    .join('');

  const parentsRows =
    (parents || []).length > 0
      ? (parents || [])
          .map(
            (p) =>
              `<tr><td>${escHtml(fullName(p))}</td><td>${escHtml(p.relationship)}</td><td>${escHtml(p.email)}</td><td>${escHtml(p.phone)}</td></tr>`
          )
          .join('')
      : `<tr><td colspan="4">${escHtml(labels.noneParents)}</td></tr>`;

  const famRows =
    (familyMembers || []).length > 0
      ? (familyMembers || [])
          .map((m) => {
            const mnat =
              m.nationality && typeof m.nationality === 'object'
                ? m.nationality.Title ?? m.nationality.title
                : '';
            return `<tr><td>${escHtml(fullName(m))}</td><td>${escHtml(m.relationship)}</td><td>${escHtml(m.dateOfBirth)}</td><td>${escHtml(mnat)}</td></tr>`;
          })
          .join('')
      : `<tr><td colspan="4">${escHtml(labels.noneHousehold)}</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escHtml(labels.docTitle)} — ${escHtml(fullName(data))}</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; font-size: 12pt; color: #111; margin: 1.2cm; }
    h1 { font-size: 1.25rem; margin: 0 0 0.75rem; }
    h2 { font-size: 1rem; margin: 1.25rem 0 0.5rem; border-bottom: 1px solid #ccc; padding-bottom: 0.25rem; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 0.5rem; }
    th, td { text-align: left; padding: 0.35rem 0.5rem; border: 1px solid #ddd; vertical-align: top; }
    th { width: 28%; background: #f5f5f5; font-weight: 600; }
    thead th { background: #eee; }
    .footer { margin-top: 1.5rem; font-size: 0.75rem; color: #666; }
    @media print { body { margin: 0.8cm; } }
  </style>
</head>
<body>
  <h1>${escHtml(labels.docTitle)}</h1>
  <h2>${escHtml(labels.sectionStudent)}</h2>
  <table>
    <tbody>${studentRowsHtml}</tbody>
  </table>
  <h2>${escHtml(labels.sectionParents)}</h2>
  <table>
    <thead><tr><th>${escHtml(labels.colParentName)}</th><th>${escHtml(labels.colRelationship)}</th><th>${escHtml(labels.colEmail)}</th><th>${escHtml(labels.colPhone)}</th></tr></thead>
    <tbody>${parentsRows}</tbody>
  </table>
  <h2>${escHtml(labels.sectionHousehold)}</h2>
  <table>
    <thead><tr><th>${escHtml(labels.colMemberName)}</th><th>${escHtml(labels.colRelation)}</th><th>${escHtml(labels.colDob)}</th><th>${escHtml(labels.colNationality)}</th></tr></thead>
    <tbody>${famRows}</tbody>
  </table>
  <p class="footer">${escHtml(labels.footer)}</p>
</body>
</html>`;

  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
  }, 100);
}
