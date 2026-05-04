import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  addParent,
  deleteParent,
  editParent,
  getParents,
  getStudents,
} from '../../api/api';
import { withLegacyId } from '../../api/normalize';
import ShowToast from '../../components/ShowToast';
import { useAuth } from '../useAuth';
import { useLanguage } from '../../providers/LanguageProvider';
import { downloadParentsCsv } from '../../utils/csvExport';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  studentId: '',
  relationship: 'Parent',
};

export function useParents() {
  const { t } = useLanguage();
  const { authUser, canCreate, canDelete, canEdit, isStudent } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(() => {
    getParents().then((response) => {
      let list = response.data || [];
      if (isStudent && authUser?.studentId) {
        list = list.filter((parentRow) => parentRow.studentId === authUser.studentId);
      }
      setParents(list.map(withLegacyId));
    });
  }, [authUser?.studentId, isStudent]);

  useEffect(() => {
    load();
    getStudents().then((response) => setStudents(response.data || []));
  }, [load]);

  const filteredParents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return parents;

    return parents.filter((parentRow) => {
      const blob = [parentRow.firstName, parentRow.lastName, parentRow.email, parentRow.phone]
        .map((field) => String(field ?? '').toLowerCase())
        .join(' ');
      return blob.includes(query);
    });
  }, [parents, searchQuery]);

  const parentsExportFilename = useMemo(() => {
    const dateValue = new Date();
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    return t('parentsPage.exportFilename', { date: `${year}-${month}-${day}` });
  }, [t]);

  const handleExportParentsCsv = useCallback(() => {
    if (!filteredParents.length) return;
    downloadParentsCsv(filteredParents, parentsExportFilename);
  }, [filteredParents, parentsExportFilename]);

  const openNew = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  }, []);

  const openEdit = useCallback((row) => {
    setEditingId(row.id ?? row.ID);
    setForm({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email || '',
      phone: row.phone || '',
      studentId: String(row.studentId),
      relationship: row.relationship || 'Parent',
    });
    setOpen(true);
  }, []);

  const openParentParam = searchParams.get('openParent');

  useEffect(() => {
    if (!openParentParam) return;

    const id = Number(openParentParam);
    if (!Number.isFinite(id) || id < 1) {
      setSearchParams(
        (previousParams) => {
          const nextParams = new URLSearchParams(previousParams);
          nextParams.delete('openParent');
          return nextParams;
        },
        { replace: true }
      );
      return;
    }

    if (parents.length === 0) return;

    const row = parents.find((parentRow) => (parentRow.id ?? parentRow.ID) === id);
    if (!row) {
      setSearchParams(
        (previousParams) => {
          const nextParams = new URLSearchParams(previousParams);
          nextParams.delete('openParent');
          return nextParams;
        },
        { replace: true }
      );
      return;
    }

    openEdit(row);
    setSearchParams(
      (previousParams) => {
        const nextParams = new URLSearchParams(previousParams);
        nextParams.delete('openParent');
        return nextParams;
      },
      { replace: true }
    );
  }, [openEdit, openParentParam, parents, setSearchParams]);

  const handleSave = useCallback(() => {
    if (!form.studentId) {
      ShowToast('error', 'Select a student');
      return;
    }

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      studentId: Number(form.studentId),
      relationship: form.relationship,
    };

    const request = editingId ? editParent(editingId, payload) : addParent(payload);
    request
      .then(() => {
        ShowToast('success', editingId ? 'Parent updated' : 'Parent added');
        setOpen(false);
        load();
      })
      .catch((error) =>
        ShowToast('error', error?.response?.data?.message || 'Request failed')
      );
  }, [editingId, form, load]);

  const handleDelete = useCallback(
    (id) => {
      if (!window.confirm('Delete this parent?')) return;
      deleteParent(id)
        .then(() => {
          ShowToast('success', 'Deleted');
          load();
        })
        .catch((error) => ShowToast('error', error?.message || 'Delete failed'));
    },
    [load]
  );

  const columns = useMemo(() => {
    const dash = t('table.emptyDash');
    return [
      {
        id: 'name',
        label: t('table.name'),
        render: (parentRow) => `${parentRow.firstName} ${parentRow.lastName}`,
      },
      { id: 'email', label: t('table.email'), render: (parentRow) => parentRow.email || dash },
      { id: 'phone', label: t('table.phone'), render: (parentRow) => parentRow.phone || dash },
      { id: 'studentId', label: t('table.student'), accessor: 'studentId' },
      {
        id: 'relationship',
        label: t('table.relationship'),
        render: (parentRow) => parentRow.relationship,
      },
      ...(canEdit || canDelete
        ? [
            {
              id: 'actions',
              label: t('table.actions'),
              align: 'end',
              render: (parentRow) => (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'end',
                    gap: 0.5,
                    width: '100%',
                  }}
                >
                  {canEdit ? (
                    <IconButton
                      size="small"
                      aria-label="edit"
                      onClick={() => openEdit(parentRow)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                  {canDelete ? (
                    <IconButton
                      size="small"
                      aria-label="delete"
                      color="error"
                      onClick={() => handleDelete(parentRow.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </Box>
              ),
            },
          ]
        : []),
    ];
  }, [canDelete, canEdit, handleDelete, openEdit, t]);

  const closeDrawer = useCallback(() => setOpen(false), []);

  return {
    canCreate,
    columns,
    editingId,
    filteredParents,
    form,
    handleExportParentsCsv,
    handleSave,
    open,
    openNew,
    parents,
    searchQuery,
    setForm,
    setSearchQuery,
    students,
    closeDrawer,
  };
}

export default useParents;
