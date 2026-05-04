import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, IconButton, Switch } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getAdminUsers, getStudents, patchAdminUser } from '../../api/api';
import { withLegacyId } from '../../api/normalize';
import ShowToast from '../../components/ShowToast';
import { useLanguage } from '../../providers/LanguageProvider';

const emptyForm = {
  name: '',
  email: '',
  role: 'teacher',
  active: true,
  studentId: '',
  newPassword: '',
};

export function useAdminUsers() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');

  const load = useCallback(() => {
    getAdminUsers()
      .then((response) => setRows((response.data || []).map(withLegacyId)))
      .catch((error) =>
        ShowToast('error', error?.response?.data?.message || t('teachersPage.loadError'))
      );
  }, [t]);

  useEffect(() => {
    load();
    getStudents().then((response) => setStudents(response.data || []));
  }, [load]);

  const filteredRows = useMemo(() => {
    if (roleFilter === 'all') return rows;
    return rows.filter((userRow) => (userRow.role || '').toLowerCase() === roleFilter);
  }, [roleFilter, rows]);

  const openEdit = useCallback((row) => {
    setEditingId(row.id ?? row.ID);
    setForm({
      name: row.name || '',
      email: row.email || '',
      role: row.role || 'teacher',
      active: row.active !== false,
      studentId: row.studentId != null ? String(row.studentId) : '',
      newPassword: '',
    });
    setOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (form.role === 'student' && !form.studentId) {
      ShowToast('error', t('parentsPage.selectStudent'));
      return;
    }
    if (form.newPassword && form.newPassword.length > 0 && form.newPassword.length < 4) {
      ShowToast('error', t('adminUsersPage.newPasswordHint'));
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      active: form.active,
      studentId: form.role === 'student' && form.studentId ? Number(form.studentId) : null,
    };
    if (form.newPassword && form.newPassword.length >= 4) {
      payload.password = form.newPassword;
    }

    patchAdminUser(editingId, payload)
      .then(() => {
        ShowToast('success', t('teachersPage.saved'));
        setOpen(false);
        load();
      })
      .catch((error) =>
        ShowToast('error', error?.response?.data?.message || t('teachersPage.saveError'))
      );
  }, [editingId, form, load, t]);

  const toggleActive = useCallback(
    (row, next) => {
      const id = row.id ?? row.ID;
      patchAdminUser(id, { active: next })
        .then(() => {
          ShowToast(
            'success',
            next ? t('teachersPage.activated') : t('teachersPage.deactivated')
          );
          load();
        })
        .catch((error) =>
          ShowToast('error', error?.response?.data?.message || t('teachersPage.saveError'))
        );
    },
    [load, t]
  );

  const columns = useMemo(() => {
    const dash = t('table.emptyDash');
    return [
      {
        id: 'name',
        label: t('table.name'),
        render: (userRow) => userRow.name || dash,
      },
      { id: 'email', label: t('table.email'), accessor: 'email' },
      { id: 'role', label: t('table.role'), accessor: 'role' },
      {
        id: 'studentLink',
        label: t('table.studentLink'),
        render: (userRow) =>
          userRow.role === 'student' && userRow.studentId != null
            ? `#${userRow.studentId}`
            : dash,
      },
      {
        id: 'active',
        label: t('table.active'),
        render: (userRow) => (
          <Switch
            size="small"
            checked={userRow.active !== false}
            onChange={(event) => toggleActive(userRow, event.target.checked)}
          />
        ),
      },
      {
        id: 'actions',
        label: t('table.actions'),
        align: 'end',
        render: (userRow) => (
          <Box sx={{ display: 'flex', justifyContent: 'end', width: '100%' }}>
            <IconButton size="small" onClick={() => openEdit(userRow)} aria-label="edit">
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ];
  }, [openEdit, t, toggleActive]);

  const closeDrawer = useCallback(() => setOpen(false), []);

  return {
    closeDrawer,
    columns,
    editingId,
    filteredRows,
    form,
    handleSave,
    open,
    roleFilter,
    rows,
    setForm,
    setRoleFilter,
    students,
  };
}

export default useAdminUsers;
