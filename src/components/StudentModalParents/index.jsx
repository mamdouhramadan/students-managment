import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AppDrawer from '../AppDrawer';
import { useLanguage } from '../../providers/LanguageProvider';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link as RouterLink } from 'react-router-dom';
import {
  addParent,
  editParent,
  deleteParent,
  getParentsByStudentId,
} from '../../api/api';
import { withLegacyId } from '../../api/normalize';
import { studentActions } from '../../helpers';
import studentStore from '../../flux/StudentStore';
import ShowToast from '../ShowToast';
import { useAuth } from '../../hooks/useAuth';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  relationship: 'Parent',
};

const refreshParentsInStore = async (studentId) => {
  const res = await getParentsByStudentId(studentId);
  const list = (res.data || []).map(withLegacyId);
  const current = studentStore._student;
  studentActions.updateStudent({
    ...current,
    Parents: list,
  });
};

const StudentModalParents = ({ parents = [], studentId, modalType }) => {
  const { t } = useLanguage();
  const { authUser, canCreate, canEdit, canDelete, isTeacher, isStudent } = useAuth();
  const allowMutations = modalType === 'edit' && isTeacher;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id ?? row.ID);
    setForm({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email || '',
      phone: row.phone || '',
      relationship: row.relationship || 'Parent',
    });
    setOpen(true);
  };

  const handleSave = useCallback(() => {
    if (!studentId) return;
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      studentId: Number(studentId),
      relationship: form.relationship,
    };
    const req = editingId
      ? editParent(editingId, payload)
      : addParent(payload);
    req
      .then(() => {
        ShowToast('success', editingId ? 'Parent updated' : 'Parent added');
        setOpen(false);
        return refreshParentsInStore(studentId);
      })
      .catch((e) =>
        ShowToast('error', e?.response?.data?.message || 'Request failed')
      );
  }, [editingId, form, studentId]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this parent?')) return;
    deleteParent(id)
      .then(() => {
        ShowToast('success', 'Deleted');
        return refreshParentsInStore(studentId);
      })
      .catch((e) => ShowToast('error', e?.message || 'Delete failed'));
  };

  const rows =
    isStudent && authUser?.studentId != null
      ? parents.filter((p) => (p.studentId ?? p.studentID) === authUser.studentId)
      : parents;

  const showActions =
    allowMutations && (canEdit || canDelete);
  const showAdd = allowMutations && canCreate;

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h6">Parents / guardians</Typography>
        {showAdd && (
          <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={openNew}>
            Add parent
          </Button>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Full school-wide list:{' '}
        <Link component={RouterLink} to="/parents" underline="hover">
          Parents
        </Link>{' '}
        in the sidebar.
      </Typography>
      <Paper
        variant="outlined"
        sx={{ overflow: 'auto', bgcolor: 'background.paper', borderColor: 'divider' }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Relationship</TableCell>
              {showActions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 5 : 4} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No parents on file
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((p) => (
                <TableRow key={p.id ?? p.ID}>
                  <TableCell>
                    {p.firstName} {p.lastName}
                  </TableCell>
                  <TableCell>{p.email || '—'}</TableCell>
                  <TableCell>{p.phone || '—'}</TableCell>
                  <TableCell>{p.relationship || '—'}</TableCell>
                  {showActions && (
                    <TableCell align="right">
                      {canEdit && (
                        <IconButton
                          size="small"
                          aria-label="edit"
                          onClick={() => openEdit(p)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton
                          size="small"
                          aria-label="delete"
                          color="error"
                          onClick={() => handleDelete(p.id ?? p.ID)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <AppDrawer
        nested
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? t('parentsPage.editParent') : t('parentsPage.addParent')}
        subtitle={t('table.student') + ` #${studentId}`}
        size="md"
        footer={
          <>
            <Button color="inherit" variant="outlined" onClick={() => setOpen(false)}>
              {t('drawer.cancel')}
            </Button>
            <Button variant="contained" onClick={handleSave}>
              {t('drawer.save')}
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('table.firstName')}
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            fullWidth
            required
            name="firstName"
            autoComplete="given-name"
          />
          <TextField
            label={t('table.lastName')}
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            fullWidth
            required
            name="lastName"
            autoComplete="family-name"
          />
          <TextField
            label={t('table.email')}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            fullWidth
            autoComplete="email"
          />
          <TextField
            label={t('table.phone')}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            fullWidth
            autoComplete="tel"
          />
          <TextField
            label={t('table.relationship')}
            value={form.relationship}
            onChange={(e) => setForm({ ...form, relationship: e.target.value })}
            fullWidth
          />
        </Box>
      </AppDrawer>
    </Box>
  );
};

export default StudentModalParents;
