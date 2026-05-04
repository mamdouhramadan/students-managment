import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import {
  deleteMyReminder,
  getMyReminders,
  patchMyReminder,
  postMyReminder,
} from '../../api/api';
import ShowToast from '../../components/ShowToast';
import { useLanguage } from '../../providers/LanguageProvider';

const emptyForm = {
  title: '',
  notes: '',
  dueDate: '',
};

export function useReminders() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [dueFilter, setDueFilter] = useState('all');

  const load = useCallback(() => {
    setLoading(true);
    getMyReminders()
      .then((response) => setRows(response.data || []))
      .catch((error) => {
        ShowToast('error', error?.response?.data?.message || t('remindersPage.loadError'));
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((row) => {
    setEditingId(row.id);
    setForm({
      title: row.title || '',
      notes: row.notes || '',
      dueDate: row.dueDate || '',
    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.title.trim()) {
      ShowToast('error', t('remindersPage.titleRequired'));
      return;
    }

    const payload = {
      title: form.title.trim(),
      notes: form.notes,
      dueDate: form.dueDate || null,
    };
    const request = editingId ? patchMyReminder(editingId, payload) : postMyReminder(payload);
    request
      .then(() => {
        ShowToast('success', t('remindersPage.saved'));
        setDialogOpen(false);
        load();
      })
      .catch((error) =>
        ShowToast('error', error?.response?.data?.message || t('remindersPage.saveError'))
      );
  }, [editingId, form, load, t]);

  const toggleDone = useCallback(
    (row) => {
      patchMyReminder(row.id, { done: !row.done })
        .then(({ data }) => {
          setRows((previousRows) =>
            previousRows.map((previousRow) => (previousRow.id === row.id ? data : previousRow))
          );
        })
        .catch((error) =>
          ShowToast('error', error?.response?.data?.message || t('remindersPage.saveError'))
        );
    },
    [t]
  );

  const filteredRows = useMemo(() => {
    if (dueFilter === 'all') return rows;

    return rows.filter((row) => {
      const rawDue = row.dueDate;
      if (!rawDue) return false;

      const dueMoment = moment(rawDue);
      if (!dueMoment.isValid()) return false;

      const startOfToday = moment().startOf('day');
      if (dueFilter === 'today') {
        return dueMoment.isSame(startOfToday, 'day');
      }
      if (dueFilter === 'week') {
        return dueMoment.isBetween(
          moment().startOf('week'),
          moment().endOf('week'),
          'day',
          '[]'
        );
      }
      if (dueFilter === 'overdue') {
        return dueMoment.startOf('day').isBefore(startOfToday) && !row.done;
      }
      return true;
    });
  }, [dueFilter, rows]);

  const handleDelete = useCallback(
    (id) => {
      if (!window.confirm(t('remindersPage.confirmDelete'))) return;
      deleteMyReminder(id)
        .then(() => {
          ShowToast('success', t('remindersPage.deleted'));
          load();
        })
        .catch((error) =>
          ShowToast('error', error?.response?.data?.message || t('remindersPage.deleteError'))
        );
    },
    [load, t]
  );

  const closeDialog = useCallback(() => setDialogOpen(false), []);

  return {
    closeDialog,
    dialogOpen,
    dueFilter,
    editingId,
    filteredRows,
    form,
    handleDelete,
    handleSave,
    loading,
    openEdit,
    openNew,
    rows,
    setDueFilter,
    setForm,
    toggleDone,
  };
}

export default useReminders;
