/** JSON Server uses `id`; UI historically used `ID` in places */
export function withLegacyId(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = { ...obj };
  if ('id' in out && out.ID == null) out.ID = out.id;
  return out;
}

export function normalizeNationality(n) {
  if (!n) return n;
  return { ...n, ID: n.id, id: n.id };
}

export function normalizeNationalities(list) {
  return (list || []).map(normalizeNationality);
}

export function extractNationalityId(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'object') {
    return Number(value.ID ?? value.id ?? value.nationalityId);
  }
  return Number(value);
}

export function studentPayloadFromForm(data) {
  let classGroupId = null;
  if (data.classGroupId !== undefined && data.classGroupId !== null && data.classGroupId !== '') {
    const n = Number(data.classGroupId);
    classGroupId = Number.isFinite(n) ? n : null;
  }
  const tagIds = Array.isArray(data.tagIds)
    ? [...new Set(data.tagIds.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0))]
    : [];
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth,
    nationalityId: extractNationalityId(data.nationality),
    address: data.address ?? '',
    eid: data.eid ?? '',
    email: data.email ?? '',
    notes: data.notes != null ? String(data.notes) : '',
    classGroupId,
    active: data.active !== false,
    tagIds,
  };
}

export function buildStudentModalShape(
  rawStudent,
  familyMembers,
  nationalities,
  parents = []
) {
  const nat = nationalities.find((n) => n.id === rawStudent.nationalityId);
  const nationality = nat ? { ID: nat.id, Title: nat.Title, id: nat.id } : null;
  const base = withLegacyId({ ...rawStudent });
  const tagIds = Array.isArray(rawStudent.tagIds)
    ? rawStudent.tagIds.map((x) => Number(x)).filter((n) => Number.isFinite(n))
    : [];
  const data = {
    ...base,
    firstName: rawStudent.firstName,
    lastName: rawStudent.lastName,
    dateOfBirth: rawStudent.dateOfBirth,
    nationality,
    nationalityId: rawStudent.nationalityId,
    notes: rawStudent.notes != null ? String(rawStudent.notes) : '',
    classGroupId:
      rawStudent.classGroupId !== undefined && rawStudent.classGroupId !== null
        ? Number(rawStudent.classGroupId)
        : null,
    active: rawStudent.active !== false,
    tagIds,
    createdAt: rawStudent.createdAt,
    updatedAt: rawStudent.updatedAt,
    ID: rawStudent.id,
    id: rawStudent.id,
  };
  const fam = (familyMembers || []).map((m) => normalizeFamilyMember(m, nationalities));
  const par = (parents || []).map((p) => withLegacyId({ ...p }));
  return {
    data,
    FamilyMembers: fam,
    Parents: par,
  };
}

export function normalizeFamilyMember(m, nationalities) {
  const row = withLegacyId({ ...m });
  const nat = nationalities.find((n) => n.id === m.nationalityId);
  return {
    ...row,
    nationality: nat ? { ID: nat.id, Title: nat.Title, id: nat.id } : null,
  };
}
