/**
 * JSON Server + json-server-auth (JWT login/register).
 * Custom login (before json-server-auth) enforces `active`; /api/* guards use same rules.
 */
const path = require('path');
const {
  buildVisibleDays,
  parseWeekendDays,
  getAllowedDayIdSet,
  ALL_DAY_IDS,
} = require('./timetableCalendar');
const express = require('express');
const jsonServer = require('json-server');
const auth = require('json-server-auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = 'json-server-auth-123456';
const JWT_EXPIRES_IN = '1h';
const BCRYPT_SALT_ROUNDS = 10;

const INACTIVE_LOGIN_MSG =
  'You are not able to login please contact the administrator to activate your account';

const app = jsonServer.create();
app.use(express.json());
const router = jsonServer.router(path.join(__dirname, 'db.json'));
app.db = router.db;

const middlewares = jsonServer.defaults({ bodyParser: true });
const PORT = process.env.PORT || 3101;

function isUserActive(user) {
  return user && user.active !== false;
}

/** Custom login — runs instead of json-server-auth /login so we can block inactive accounts */
function loginHandler(req, res, next) {
  const { email, password } = req.body || {};
  if (!email || !String(email).trim() || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const db = req.app.db;
  const user = db.get('users').find({ email: String(email).trim() }).value();
  if (!user) {
    return res.status(400).json({ message: 'Cannot find user' });
  }
  if (!isUserActive(user)) {
    return res.status(403).json({ message: INACTIVE_LOGIN_MSG });
  }
  bcrypt
    .compare(password, user.password)
    .then((same) => {
      if (!same) {
        return res.status(400).json({ message: 'Incorrect password' });
      }
      return new Promise((resolve, reject) => {
        jwt.sign(
          { email: user.email },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN, subject: String(user.id) },
          (err, accessToken) => (err ? reject(err) : resolve(accessToken))
        );
      });
    })
    .then((accessToken) => {
      const { password: _pw, ...userWithoutPassword } = user;
      res.json({ accessToken, user: userWithoutPassword });
    })
    .catch(next);
}

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization' });
  }
  try {
    const token = h.slice(7);
    jwt.verify(token, JWT_SECRET);
    const decoded = jwt.decode(token);
    req.userId = Number(decoded.sub);
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  const db = req.app.db;
  const user = db.get('users').find({ id: req.userId }).value();
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  if (!isUserActive(user)) {
    return res.status(403).json({ message: INACTIVE_LOGIN_MSG });
  }
  req.authUser = user;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.authUser || req.authUser.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

function requireStaff(req, res, next) {
  const r = req.authUser?.role;
  if (r !== 'teacher' && r !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

function nextCollectionId(db, key) {
  const list = db.get(key).value() || [];
  return list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;
}

function readTimetableCalendarFromDb(db) {
  const row = db.get('siteSettings').value() || {};
  let start =
    row.timetableWeekStartDay && ALL_DAY_IDS.includes(String(row.timetableWeekStartDay).toLowerCase())
      ? String(row.timetableWeekStartDay).toLowerCase()
      : 'sun';
  let weekend = parseWeekendDays(row.timetableWeekendDays).slice(0, 3);
  let days = buildVisibleDays(start, weekend);
  if (days.length === 0) {
    weekend = ['fri', 'sat'];
    days = buildVisibleDays(start, weekend);
  }
  if (days.length === 0) {
    start = 'sun';
    weekend = [];
    days = buildVisibleDays(start, weekend);
  }
  const allowed = getAllowedDayIdSet(start, weekend);
  return { days, allowed, weekStartDay: start, weekendDays: weekend };
}

function getTimetableConfigHandler(req, res) {
  const db = req.app.db;
  const grades = db.get('grades').value() || [];
  const classGroups = db.get('classGroups').value() || [];
  const courses = db.get('courses').value() || [];
  const periods = [...(db.get('timetablePeriods').value() || [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const users = db.get('users').value() || [];
  const teachers = users
    .filter((u) => u.role === 'teacher' && isUserActive(u))
    .map((u) => ({ id: u.id, name: u.name, email: u.email }));
  const cal = readTimetableCalendarFromDb(db);
  const timetableCells = db.get('timetableCells').value() || [];
  res.json({
    days: cal.days,
    periods,
    grades,
    classGroups,
    courses,
    teachers,
    timetableCells,
    timetableWeekStartDay: cal.weekStartDay,
    timetableWeekendDays: cal.weekendDays,
  });
}

function getTimetableTeachersHandler(req, res) {
  const db = req.app.db;
  const users = db.get('users').value() || [];
  const teachers = users
    .filter((u) => u.role === 'teacher' && isUserActive(u))
    .map((u) => ({ id: u.id, name: u.name, email: u.email }));
  res.json(teachers);
}

function getCoursesHandler(req, res) {
  const db = req.app.db;
  res.json(db.get('courses').value() || []);
}

function postCourseHandler(req, res) {
  const db = req.app.db;
  const name = req.body?.name != null ? String(req.body.name).trim() : '';
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  const code = req.body?.code != null ? String(req.body.code).trim() : '';
  const id = nextCollectionId(db, 'courses');
  const row = { id, name, code };
  db.get('courses').push(row).write();
  res.status(201).json(row);
}

function patchCourseHandler(req, res) {
  const db = req.app.db;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  const row = db.get('courses').find({ id }).value();
  if (!row) {
    return res.status(404).json({ message: 'Not found' });
  }
  const updates = {};
  if (req.body?.name !== undefined) {
    const n = String(req.body.name).trim();
    if (!n) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }
    updates.name = n;
  }
  if (req.body?.code !== undefined) {
    updates.code = req.body.code != null ? String(req.body.code).trim() : '';
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No updates' });
  }
  db.get('courses').find({ id }).assign(updates).write();
  res.json(db.get('courses').find({ id }).value());
}

function deleteCourseHandler(req, res) {
  const db = req.app.db;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  const row = db.get('courses').find({ id }).value();
  if (!row) {
    return res.status(404).json({ message: 'Not found' });
  }
  const cells = db.get('timetableCells').value() || [];
  if (cells.some((c) => Number(c.courseId) === id)) {
    return res.status(400).json({ message: 'Cannot delete: course is used in timetables' });
  }
  db.get('courses').remove({ id }).write();
  res.json({ message: 'Deleted' });
}

function patchMyClassGroupHandler(req, res) {
  const db = req.app.db;
  if (req.authUser.role !== 'student') {
    return res.status(403).json({ message: 'Only students can set their class' });
  }
  const sid = req.authUser.studentId;
  if (sid == null || !Number.isFinite(Number(sid))) {
    return res.status(400).json({ message: 'No student profile linked to this account' });
  }
  const studentId = Number(sid);
  const student = db.get('students').find({ id: studentId }).value();
  if (!student) {
    return res.status(404).json({ message: 'Student record not found' });
  }
  const raw = req.body?.classGroupId;
  let classGroupId = null;
  if (raw !== undefined && raw !== null && raw !== '') {
    classGroupId = Number(raw);
    if (!Number.isFinite(classGroupId)) {
      return res.status(400).json({ message: 'Invalid classGroupId' });
    }
    const cg = db.get('classGroups').find({ id: classGroupId }).value();
    if (!cg) {
      return res.status(400).json({ message: 'Class not found' });
    }
  }
  db.get('students').find({ id: studentId }).assign({ classGroupId }).write();
  const updated = db.get('students').find({ id: studentId }).value();
  res.json({ classGroupId: updated.classGroupId ?? null });
}

function getTimetableClassHandler(req, res) {
  const db = req.app.db;
  const classGroupId = Number(req.params.classGroupId);
  if (!Number.isFinite(classGroupId)) {
    return res.status(400).json({ message: 'Invalid class id' });
  }
  const cg = db.get('classGroups').find({ id: classGroupId }).value();
  if (!cg) {
    return res.status(404).json({ message: 'Class not found' });
  }
  if (req.authUser.role === 'student') {
    const sid = req.authUser.studentId;
    if (sid == null) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const st = db.get('students').find({ id: Number(sid) }).value();
    if (!st || Number(st.classGroupId) !== classGroupId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }
  const all = db.get('timetableCells').value() || [];
  const cells = all.filter((c) => Number(c.classGroupId) === classGroupId);
  res.json({ classGroupId, cells });
}

function putTimetableClassHandler(req, res) {
  const db = req.app.db;
  const classGroupId = Number(req.params.classGroupId);
  if (!Number.isFinite(classGroupId)) {
    return res.status(400).json({ message: 'Invalid class id' });
  }
  const cg = db.get('classGroups').find({ id: classGroupId }).value();
  if (!cg) {
    return res.status(404).json({ message: 'Class not found' });
  }
  const entries = req.body?.entries;
  if (!Array.isArray(entries)) {
    return res.status(400).json({ message: 'entries must be an array' });
  }
  const cal = readTimetableCalendarFromDb(db);
  const allowedDays = cal.allowed;
  if (allowedDays.size === 0) {
    return res.status(400).json({ message: 'No teaching days configured' });
  }

  const courseRows = db.get('courses').value() || [];
  const validCourseIds = new Set(courseRows.map((c) => Number(c.id)));
  const teacherRows = (db.get('users').value() || []).filter(
    (u) => u.role === 'teacher' && isUserActive(u)
  );
  const validTeacherIds = new Set(teacherRows.map((u) => Number(u.id)));

  const periods = db.get('timetablePeriods').value() || [];
  const maxPeriod = periods.length
    ? Math.max(...periods.map((p) => Number(p.order) || 0))
    : 7;

  const normalized = [];
  const seen = new Set();
  for (const e of entries) {
    const day = e?.day != null ? String(e.day).toLowerCase() : '';
    const period = Number(e?.period);
    if (!allowedDays.has(day)) {
      return res.status(400).json({ message: `Invalid day: ${e?.day}` });
    }
    if (!Number.isFinite(period) || period < 1 || period > maxPeriod) {
      return res.status(400).json({ message: `Invalid period: ${e?.period}` });
    }
    const key = `${day}:${period}`;
    if (seen.has(key)) {
      return res.status(400).json({ message: `Duplicate slot ${key}` });
    }
    seen.add(key);

    let courseId = null;
    if (e.courseId != null && e.courseId !== '') {
      courseId = Number(e.courseId);
      if (!Number.isFinite(courseId) || !validCourseIds.has(courseId)) {
        return res.status(400).json({ message: 'Invalid courseId' });
      }
    }
    let teacherUserId = null;
    if (e.teacherUserId != null && e.teacherUserId !== '') {
      teacherUserId = Number(e.teacherUserId);
      if (!Number.isFinite(teacherUserId) || !validTeacherIds.has(teacherUserId)) {
        return res.status(400).json({ message: 'Invalid teacherUserId' });
      }
    }
    const room = e.room != null ? String(e.room).trim() : '';
    if (courseId || teacherUserId || room) {
      normalized.push({ day, period, courseId, teacherUserId, room });
    }
  }

  db.get('timetableCells').remove((c) => Number(c.classGroupId) === classGroupId).write();

  let nextId = nextCollectionId(db, 'timetableCells');
  for (const row of normalized) {
    db.get('timetableCells')
      .push({
        id: nextId,
        classGroupId,
        day: row.day,
        period: row.period,
        courseId: row.courseId,
        teacherUserId: row.teacherUserId,
        room: row.room,
      })
      .write();
    nextId += 1;
  }

  const cells = (db.get('timetableCells').value() || []).filter(
    (c) => Number(c.classGroupId) === classGroupId
  );
  res.json({ classGroupId, cells });
}

function postTimetableGradeHandler(req, res) {
  const db = req.app.db;
  const name = req.body?.name != null ? String(req.body.name).trim() : '';
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  const id = nextCollectionId(db, 'grades');
  const row = { id, name };
  db.get('grades').push(row).write();
  res.status(201).json(row);
}

function patchTimetableGradeHandler(req, res) {
  const db = req.app.db;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  const row = db.get('grades').find({ id }).value();
  if (!row) {
    return res.status(404).json({ message: 'Not found' });
  }
  const name = req.body?.name;
  if (name === undefined) {
    return res.status(400).json({ message: 'name is required' });
  }
  const trimmed = String(name).trim();
  if (!trimmed) {
    return res.status(400).json({ message: 'Name cannot be empty' });
  }
  db.get('grades').find({ id }).assign({ name: trimmed }).write();
  res.json(db.get('grades').find({ id }).value());
}

function deleteTimetableGradeHandler(req, res) {
  const db = req.app.db;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  const row = db.get('grades').find({ id }).value();
  if (!row) {
    return res.status(404).json({ message: 'Not found' });
  }
  const groups = db.get('classGroups').value() || [];
  if (groups.some((g) => Number(g.gradeId) === id)) {
    return res.status(400).json({ message: 'Cannot delete: class groups still use this grade' });
  }
  db.get('grades').remove({ id }).write();
  res.json({ message: 'Deleted' });
}

function postTimetableClassGroupHandler(req, res) {
  const db = req.app.db;
  const gradeId = Number(req.body?.gradeId);
  const name = req.body?.name != null ? String(req.body.name).trim() : '';
  if (!Number.isFinite(gradeId)) {
    return res.status(400).json({ message: 'gradeId is required' });
  }
  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }
  const g = db.get('grades').find({ id: gradeId }).value();
  if (!g) {
    return res.status(400).json({ message: 'Grade not found' });
  }
  const id = nextCollectionId(db, 'classGroups');
  const row = { id, gradeId, name };
  db.get('classGroups').push(row).write();
  res.status(201).json(row);
}

function patchTimetableClassGroupHandler(req, res) {
  const db = req.app.db;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  const row = db.get('classGroups').find({ id }).value();
  if (!row) {
    return res.status(404).json({ message: 'Not found' });
  }
  const updates = {};
  if (req.body?.gradeId !== undefined) {
    const gradeId = Number(req.body.gradeId);
    if (!Number.isFinite(gradeId)) {
      return res.status(400).json({ message: 'Invalid gradeId' });
    }
    const g = db.get('grades').find({ id: gradeId }).value();
    if (!g) {
      return res.status(400).json({ message: 'Grade not found' });
    }
    updates.gradeId = gradeId;
  }
  if (req.body?.name !== undefined) {
    const name = String(req.body.name).trim();
    if (!name) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }
    updates.name = name;
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No updates' });
  }
  db.get('classGroups').find({ id }).assign(updates).write();
  res.json(db.get('classGroups').find({ id }).value());
}

function deleteTimetableClassGroupHandler(req, res) {
  const db = req.app.db;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  const row = db.get('classGroups').find({ id }).value();
  if (!row) {
    return res.status(404).json({ message: 'Not found' });
  }
  const students = db.get('students').value() || [];
  if (students.some((s) => Number(s.classGroupId) === id)) {
    return res.status(400).json({ message: 'Cannot delete: students are assigned to this class' });
  }
  const cells = db.get('timetableCells').value() || [];
  if (cells.some((c) => Number(c.classGroupId) === id)) {
    return res.status(400).json({ message: 'Cannot delete: timetable has entries for this class' });
  }
  db.get('classGroups').remove({ id }).write();
  res.json({ message: 'Deleted' });
}

function getMeHandler(req, res) {
  const { password, ...safe } = req.authUser;
  res.json(safe);
}

function patchProfileHandler(req, res) {
  const db = req.app.db;
  const { name, email, avatarUrl } = req.body;
  const user = db.get('users').find({ id: req.userId }).value();
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) {
    const emailTrim = String(email).trim();
    const taken = db.get('users').find({ email: emailTrim }).value();
    if (taken && taken.id !== req.userId) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    updates.email = emailTrim;
  }
  if (avatarUrl !== undefined) {
    updates.avatarUrl = avatarUrl === '' || avatarUrl == null ? null : String(avatarUrl).trim();
  }

  if (Object.keys(updates).length === 0) {
    const { password, ...safe } = user;
    return res.json(safe);
  }

  db.get('users').find({ id: req.userId }).assign(updates).write();
  const updated = db.get('users').find({ id: req.userId }).value();
  const { password, ...safe } = updated;
  res.json(safe);
}

function getMyRemindersHandler(req, res) {
  const db = req.app.db;
  const list = db.get('teacherReminders').value() || [];
  const mine = list.filter((r) => r.userId === req.userId);
  mine.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  res.json(mine);
}

function postMyReminderHandler(req, res) {
  const db = req.app.db;
  const { title, notes, dueDate } = req.body || {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }
  const list = db.get('teacherReminders').value() || [];
  const nextId = list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;
  const row = {
    id: nextId,
    userId: req.userId,
    title: String(title).trim(),
    notes: notes != null ? String(notes) : '',
    dueDate:
      dueDate === undefined || dueDate === null || dueDate === ''
        ? null
        : String(dueDate).slice(0, 10),
    done: false,
    createdAt: new Date().toISOString(),
  };
  db.get('teacherReminders').push(row).write();
  res.status(201).json(row);
}

function patchMyReminderHandler(req, res) {
  const db = req.app.db;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  const row = db.get('teacherReminders').find({ id }).value();
  if (!row || row.userId !== req.userId) {
    return res.status(404).json({ message: 'Not found' });
  }
  const { title, notes, dueDate, done } = req.body || {};
  const updates = {};
  if (title !== undefined) updates.title = String(title).trim();
  if (notes !== undefined) updates.notes = String(notes);
  if (dueDate !== undefined) {
    updates.dueDate =
      dueDate === null || dueDate === '' ? null : String(dueDate).slice(0, 10);
  }
  if (done !== undefined) updates.done = Boolean(done);
  db.get('teacherReminders').find({ id }).assign(updates).write();
  const updated = db.get('teacherReminders').find({ id }).value();
  res.json(updated);
}

function deleteMyReminderHandler(req, res) {
  const db = req.app.db;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  const row = db.get('teacherReminders').find({ id }).value();
  if (!row || row.userId !== req.userId) {
    return res.status(404).json({ message: 'Not found' });
  }
  db.get('teacherReminders').remove({ id }).write();
  res.json({ message: 'Deleted' });
}

function postPasswordHandler(req, res) {
  const db = req.app.db;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }
  if (String(newPassword).length < 4) {
    return res.status(400).json({ message: 'New password is too short' });
  }
  const user = db.get('users').find({ id: req.userId }).value();
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  const hash = bcrypt.hashSync(newPassword, BCRYPT_SALT_ROUNDS);
  db.get('users').find({ id: req.userId }).assign({ password: hash }).write();
  res.json({ message: 'Password updated' });
}

function getSiteSettingsHandler(req, res) {
  const db = req.app.db;
  const row = db.get('siteSettings').value();
  if (!row || typeof row !== 'object') {
    return res.status(404).json({ message: 'Settings not found' });
  }
  res.json(row);
}

function patchSiteSettingsHandler(req, res) {
  const db = req.app.db;
  const current = db.get('siteSettings').value() || {};
  const allowed = [
    'schoolName',
    'schoolTagline',
    'supportPhone',
    'academicYear',
    'timezone',
    'announcement',
    'contactEmail',
    'admissionsEmail',
    'smtpHost',
    'smtpPort',
    'smtpSecure',
    'smtpUser',
    'emailFromName',
    'emailFromAddress',
    'emailReplyTo',
    'emailSignature',
    'themeMode',
    'primaryColorHex',
    'density',
    'timetableWeekStartDay',
    'timetableWeekendDays',
  ];
  const updates = {};
  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(req.body || {}, key)) continue;
    const v = req.body[key];
    if (key === 'timetableWeekStartDay') {
      const d = v == null ? '' : String(v).trim().toLowerCase();
      if (!ALL_DAY_IDS.includes(d)) {
        return res.status(400).json({ message: 'Invalid timetableWeekStartDay' });
      }
      updates[key] = d;
      continue;
    }
    if (key === 'timetableWeekendDays') {
      const raw = v == null ? '' : String(v);
      let arr = parseWeekendDays(raw);
      if (arr.length > 3) {
        return res.status(400).json({ message: 'At most 3 weekend days' });
      }
      updates[key] = JSON.stringify(arr);
      continue;
    }
    updates[key] = v == null ? '' : String(v);
  }
  const merged = { ...current, ...updates, id: current.id || 1 };
  const start =
    merged.timetableWeekStartDay && ALL_DAY_IDS.includes(String(merged.timetableWeekStartDay).toLowerCase())
      ? String(merged.timetableWeekStartDay).toLowerCase()
      : 'sun';
  const weekend = parseWeekendDays(merged.timetableWeekendDays).slice(0, 3);
  if (buildVisibleDays(start, weekend).length === 0) {
    return res.status(400).json({ message: 'At least one teaching day is required' });
  }
  db.get('siteSettings').assign(merged).write();
  res.json(merged);
}

function adminStatsHandler(req, res) {
  const db = req.app.db;
  const users = db.get('users').value() || [];
  const teachers = users.filter((u) => u.role === 'teacher').length;
  const studentAccounts = users.filter((u) => u.role === 'student').length;
  const admins = users.filter((u) => u.role === 'admin').length;
  const activeUsers = users.filter((u) => isUserActive(u)).length;
  const inactiveUsers = users.length - activeUsers;
  const studentRecords = (db.get('students').value() || []).length;
  const parents = (db.get('parents').value() || []).length;
  const familyMembers = (db.get('familyMembers').value() || []).length;
  const nationalities = (db.get('nationalities').value() || []).length;

  res.json({
    users: {
      total: users.length,
      teachers,
      students: studentAccounts,
      admins,
      active: activeUsers,
      inactive: inactiveUsers,
    },
    records: {
      students: studentRecords,
      parents,
      familyMembers,
      nationalities,
    },
  });
}

function adminUsersHandler(req, res) {
  const db = req.app.db;
  const users = db.get('users').value() || [];
  const safe = users.map((u) => {
    const { password, ...rest } = u;
    return { ...rest, active: isUserActive(u) };
  });
  res.json(safe);
}

function patchAdminUserHandler(req, res) {
  const db = req.app.db;
  const id = Number(req.params.id);
  const target = db.get('users').find({ id }).value();
  if (!target) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { name, email, role, active, studentId, teacherClassGroupIds } = req.body;
  const updates = {};

  if (name !== undefined) updates.name = name;
  if (email !== undefined) {
    const emailTrim = String(email).trim();
    const taken = db.get('users').find({ email: emailTrim }).value();
    if (taken && taken.id !== id) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    updates.email = emailTrim;
  }
  if (role !== undefined) {
    if (!['teacher', 'student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    updates.role = role;
  }
  if (active !== undefined) {
    updates.active = Boolean(active);
  }
  if (studentId !== undefined) {
    updates.studentId =
      studentId === null || studentId === '' ? null : Number(studentId);
  }
  if (teacherClassGroupIds !== undefined) {
    if (!Array.isArray(teacherClassGroupIds)) {
      return res.status(400).json({ message: 'teacherClassGroupIds must be an array' });
    }
    const validClassGroupIds = new Set(
      (db.get('classGroups').value() || []).map((row) => Number(row.id))
    );
    const normalizedClassGroupIds = [];
    const seenClassGroupIds = new Set();
    for (const classGroupIdRaw of teacherClassGroupIds) {
      const classGroupId = Number(classGroupIdRaw);
      if (!Number.isFinite(classGroupId) || !validClassGroupIds.has(classGroupId)) {
        return res.status(400).json({ message: 'Invalid classGroupId in teacherClassGroupIds' });
      }
      if (seenClassGroupIds.has(classGroupId)) continue;
      seenClassGroupIds.add(classGroupId);
      normalizedClassGroupIds.push(classGroupId);
    }
    updates.teacherClassGroupIds = normalizedClassGroupIds;
  }

  const mergedRole = updates.role !== undefined ? updates.role : target.role;
  if (mergedRole !== 'student') {
    updates.studentId = null;
  }
  if (mergedRole !== 'teacher') {
    updates.teacherClassGroupIds = [];
  } else {
    const nextTeacherClassGroups =
      updates.teacherClassGroupIds !== undefined
        ? updates.teacherClassGroupIds
        : target.teacherClassGroupIds;
    if (!Array.isArray(nextTeacherClassGroups)) {
      updates.teacherClassGroupIds = [];
    }
  }

  if (mergedRole === 'student') {
    const sid =
      updates.studentId !== undefined
        ? updates.studentId
        : target.studentId != null
          ? Number(target.studentId)
          : null;
    if (sid == null || !Number.isFinite(Number(sid))) {
      return res.status(400).json({ message: 'studentId is required for student accounts' });
    }
    const st = db.get('students').find({ id: Number(sid) }).value();
    if (!st) {
      return res.status(400).json({ message: 'Student record not found' });
    }
    const other = db.get('users').value() || [];
    const conflict = other.find(
      (u) => u.id !== id && u.role === 'student' && Number(u.studentId) === Number(sid)
    );
    if (conflict) {
      return res.status(400).json({ message: 'Another account is already linked to this student' });
    }
    if (updates.studentId !== undefined) {
      updates.studentId = Number(sid);
    }
  }

  if (req.body.password !== undefined && req.body.password !== null && String(req.body.password) !== '') {
    const newPassword = String(req.body.password);
    if (newPassword.length < 4) {
      return res.status(400).json({ message: 'New password is too short' });
    }
    updates.password = bcrypt.hashSync(newPassword, BCRYPT_SALT_ROUNDS);
  }

  db.get('users').find({ id }).assign(updates).write();
  const updated = db.get('users').find({ id }).value();
  const { password, ...safe } = updated;
  res.json({ ...safe, active: isUserActive(updated) });
}

function postAdminUserHandler(req, res) {
  const db = req.app.db;
  const name = req.body?.name != null ? String(req.body.name).trim() : '';
  const email = req.body?.email != null ? String(req.body.email).trim() : '';
  const password = req.body?.password != null ? String(req.body.password) : '';
  const role = req.body?.role;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ message: 'Password is required and must be at least 4 characters' });
  }
  if (!['teacher', 'student', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const taken = db.get('users').find({ email }).value();
  if (taken) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  let studentId = null;
  if (role === 'student') {
    const rawSid = req.body?.studentId;
    if (rawSid === null || rawSid === undefined || rawSid === '') {
      return res.status(400).json({ message: 'studentId is required for student accounts' });
    }
    studentId = Number(rawSid);
    if (!Number.isFinite(studentId)) {
      return res.status(400).json({ message: 'Invalid studentId' });
    }
    const st = db.get('students').find({ id: studentId }).value();
    if (!st) {
      return res.status(400).json({ message: 'Student record not found' });
    }
    const other = db.get('users').value() || [];
    if (other.some((u) => u.role === 'student' && Number(u.studentId) === studentId)) {
      return res.status(400).json({ message: 'Another account is already linked to this student' });
    }
  }

  const id = nextCollectionId(db, 'users');
  const active = req.body?.active !== undefined ? Boolean(req.body.active) : true;
  const row = {
    id,
    email,
    password: bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS),
    role,
    name,
    avatarUrl: null,
    active,
    studentId: role === 'student' ? studentId : null,
  };
  if (role === 'teacher') {
    row.teacherClassGroupIds = [];
  }
  db.get('users').push(row).write();
  const { password: _pw, ...safe } = row;
  res.status(201).json({ ...safe, active: isUserActive(row) });
}

function deleteAdminUserHandler(req, res) {
  const db = req.app.db;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  if (id === req.userId) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }
  const target = db.get('users').find({ id }).value();
  if (!target) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (target.role === 'admin') {
    const admins = (db.get('users').value() || []).filter((u) => u.role === 'admin');
    if (admins.length <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last administrator' });
    }
  }
  db.get('users').remove({ id }).write();
  res.json({ message: 'Deleted' });
}

function sanitizeStudentTagIds(raw) {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0))];
}

function postStudentWriteHandler(req, res) {
  const db = req.app.db;
  const body = req.body || {};
  const firstName = String(body.firstName || '').trim();
  const lastName = String(body.lastName || '').trim();
  const dateOfBirth = body.dateOfBirth;
  if (!firstName || !lastName || !dateOfBirth) {
    return res.status(400).json({ message: 'First name, last name, and date of birth are required' });
  }
  const nationalityId = body.nationalityId != null ? Number(body.nationalityId) : NaN;
  if (!Number.isFinite(nationalityId)) {
    return res.status(400).json({ message: 'Nationality is required' });
  }
  let classGroupId = null;
  if (body.classGroupId !== undefined && body.classGroupId !== null && body.classGroupId !== '') {
    const cg = Number(body.classGroupId);
    classGroupId = Number.isFinite(cg) ? cg : null;
  }
  const id = nextCollectionId(db, 'students');
  const now = new Date().toISOString();
  const row = {
    id,
    firstName,
    lastName,
    dateOfBirth,
    nationalityId,
    address: body.address != null ? String(body.address) : '',
    eid: body.eid != null ? String(body.eid) : '',
    email: body.email != null ? String(body.email) : '',
    notes: body.notes != null ? String(body.notes) : '',
    classGroupId,
    active: body.active !== false,
    tagIds: sanitizeStudentTagIds(body.tagIds),
    createdAt: now,
    updatedAt: now,
  };
  db.get('students').push(row).write();
  res.status(201).json(row);
}

function putStudentWriteHandler(req, res) {
  const db = req.app.db;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  const existing = db.get('students').find({ id }).value();
  if (!existing) {
    return res.status(404).json({ message: 'Not found' });
  }
  const body = req.body || {};
  const firstName = body.firstName !== undefined ? String(body.firstName).trim() : existing.firstName;
  const lastName = body.lastName !== undefined ? String(body.lastName).trim() : existing.lastName;
  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'First name and last name are required' });
  }
  const dateOfBirth = body.dateOfBirth !== undefined ? body.dateOfBirth : existing.dateOfBirth;
  if (!dateOfBirth) {
    return res.status(400).json({ message: 'Date of birth is required' });
  }
  let nationalityId = existing.nationalityId;
  if (body.nationalityId !== undefined) {
    const n = Number(body.nationalityId);
    if (!Number.isFinite(n)) {
      return res.status(400).json({ message: 'Invalid nationality' });
    }
    nationalityId = n;
  }
  let classGroupId = existing.classGroupId ?? null;
  if (body.classGroupId !== undefined) {
    if (body.classGroupId === null || body.classGroupId === '') {
      classGroupId = null;
    } else {
      const cg = Number(body.classGroupId);
      classGroupId = Number.isFinite(cg) ? cg : null;
    }
  }
  const now = new Date().toISOString();
  const priorTagIds = Array.isArray(existing.tagIds) ? existing.tagIds : [];
  const merged = {
    ...existing,
    firstName,
    lastName,
    dateOfBirth,
    nationalityId,
    address: body.address !== undefined ? String(body.address ?? '') : existing.address,
    eid: body.eid !== undefined ? String(body.eid ?? '') : existing.eid,
    email: body.email !== undefined ? String(body.email ?? '') : existing.email,
    notes: body.notes !== undefined ? String(body.notes ?? '') : existing.notes,
    classGroupId,
    active: body.active !== undefined ? body.active !== false : existing.active !== false,
    tagIds: body.tagIds !== undefined ? sanitizeStudentTagIds(body.tagIds) : priorTagIds,
    updatedAt: now,
    createdAt: existing.createdAt || now,
  };
  db.get('students').find({ id }).assign(merged).write();
  res.json(db.get('students').find({ id }).value());
}

function getStudentTagsHandler(req, res) {
  const db = req.app.db;
  res.json(db.get('studentTags').value() || []);
}

function postStudentTagHandler(req, res) {
  const db = req.app.db;
  const name = req.body?.name != null ? String(req.body.name).trim() : '';
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  const list = db.get('studentTags').value() || [];
  if (list.some((tagRow) => String(tagRow.name).toLowerCase() === name.toLowerCase())) {
    return res.status(400).json({ message: 'Tag already exists' });
  }
  const tagId = nextCollectionId(db, 'studentTags');
  const row = { id: tagId, name };
  db.get('studentTags').push(row).write();
  res.status(201).json(row);
}

function patchStudentTagHandler(req, res) {
  const db = req.app.db;
  const tagId = Number(req.params.id);
  if (!Number.isFinite(tagId)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  const row = db.get('studentTags').find({ id: tagId }).value();
  if (!row) {
    return res.status(404).json({ message: 'Not found' });
  }
  const name = req.body?.name != null ? String(req.body.name).trim() : '';
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  db.get('studentTags').find({ id: tagId }).assign({ name }).write();
  res.json(db.get('studentTags').find({ id: tagId }).value());
}

function deleteStudentTagHandler(req, res) {
  const db = req.app.db;
  const tagId = Number(req.params.id);
  if (!Number.isFinite(tagId)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  const row = db.get('studentTags').find({ id: tagId }).value();
  if (!row) {
    return res.status(404).json({ message: 'Not found' });
  }
  const students = db.get('students').value() || [];
  students.forEach((studentRow) => {
    const tagIds = (studentRow.tagIds || []).filter((tid) => Number(tid) !== tagId);
    if (tagIds.length !== (studentRow.tagIds || []).length) {
      db.get('students').find({ id: studentRow.id }).assign({ tagIds }).write();
    }
  });
  db.get('studentTags').remove({ id: tagId }).write();
  res.json({ message: 'Deleted' });
}

app.use(middlewares);
app.post('/login', loginHandler);
app.post('/signin', loginHandler);

/** Public theme tokens (no auth) — used by SPA + Tailwind `--main-color` */
function publicSiteThemeHandler(req, res) {
  const db = req.app.db;
  const row = db.get('siteSettings').value();
  let hex = row?.primaryColorHex || '#8854d0';
  hex = String(hex).trim();
  if (!hex.startsWith('#')) hex = `#${hex}`;
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    hex = '#8854d0';
  }
  const ann = row?.announcement != null ? String(row.announcement).trim() : '';
  res.json({ primaryColorHex: hex.toLowerCase(), announcement: ann });
}

app.get('/api/public/site-theme', publicSiteThemeHandler);

app.use(auth);

app.get('/api/me', requireAuth, getMeHandler);
app.patch('/api/me/profile', requireAuth, patchProfileHandler);
app.post('/api/me/password', requireAuth, postPasswordHandler);

app.get('/api/me/reminders', requireAuth, getMyRemindersHandler);
app.post('/api/me/reminders', requireAuth, postMyReminderHandler);
app.patch('/api/me/reminders/:id', requireAuth, patchMyReminderHandler);
app.delete('/api/me/reminders/:id', requireAuth, deleteMyReminderHandler);

app.get('/api/admin/stats', requireAuth, requireAdmin, adminStatsHandler);
app.get('/api/admin/users', requireAuth, requireAdmin, adminUsersHandler);
app.post('/api/admin/users', requireAuth, requireAdmin, postAdminUserHandler);
app.patch('/api/admin/users/:id', requireAuth, requireAdmin, patchAdminUserHandler);
app.delete('/api/admin/users/:id', requireAuth, requireAdmin, deleteAdminUserHandler);
app.get('/api/admin/settings', requireAuth, requireAdmin, getSiteSettingsHandler);
app.patch('/api/admin/settings', requireAuth, requireAdmin, patchSiteSettingsHandler);

app.get('/api/timetable/config', requireAuth, getTimetableConfigHandler);
app.get('/api/timetable/teachers', requireAuth, getTimetableTeachersHandler);
app.get('/api/courses', requireAuth, getCoursesHandler);
app.post('/api/courses', requireAuth, requireAdmin, postCourseHandler);
app.patch('/api/courses/:id', requireAuth, requireAdmin, patchCourseHandler);
app.delete('/api/courses/:id', requireAuth, requireAdmin, deleteCourseHandler);
app.patch('/api/me/class-group', requireAuth, patchMyClassGroupHandler);
app.get('/api/timetable/class/:classGroupId', requireAuth, getTimetableClassHandler);
app.put('/api/timetable/class/:classGroupId', requireAuth, requireStaff, putTimetableClassHandler);

app.post('/api/timetable/grades', requireAuth, requireAdmin, postTimetableGradeHandler);
app.patch('/api/timetable/grades/:id', requireAuth, requireAdmin, patchTimetableGradeHandler);
app.delete('/api/timetable/grades/:id', requireAuth, requireAdmin, deleteTimetableGradeHandler);
app.post('/api/timetable/class-groups', requireAuth, requireAdmin, postTimetableClassGroupHandler);
app.patch('/api/timetable/class-groups/:id', requireAuth, requireAdmin, patchTimetableClassGroupHandler);
app.delete('/api/timetable/class-groups/:id', requireAuth, requireAdmin, deleteTimetableClassGroupHandler);

app.post('/students', requireAuth, requireStaff, postStudentWriteHandler);
app.put('/students/:id', requireAuth, requireStaff, putStudentWriteHandler);
app.get('/api/student-tags', requireAuth, getStudentTagsHandler);
app.post('/api/student-tags', requireAuth, requireAdmin, postStudentTagHandler);
app.patch('/api/student-tags/:id', requireAuth, requireAdmin, patchStudentTagHandler);
app.delete('/api/student-tags/:id', requireAuth, requireAdmin, deleteStudentTagHandler);

app.use(router);

app.listen(PORT, () => {
  console.log(`JSON Server + json-server-auth at http://localhost:${PORT}`);
});
