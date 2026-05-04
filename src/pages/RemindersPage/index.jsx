import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PageHeader from '../../components/PageHeader';
import { useReminders } from '../../hooks/reminders';
import { useLanguage } from '../../providers/LanguageProvider';

const RemindersPage = () => {
  const { t } = useLanguage();
  const {
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
  } = useReminders();

  return (
    <Box sx={{ width: 1, maxWidth: 960, mx: 'auto' }}>
      <PageHeader
        title={t('remindersPage.title')}
        subtitle={t('remindersPage.subtitle')}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
            {t('remindersPage.add')}
          </Button>
        }
      />

      {!loading && rows.length > 0 && (
        <Stack direction="column" spacing={1} sx={{ mt: 2, mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {t('remindersPage.filterHint')}
          </Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={dueFilter}
            onChange={(_, value) => {
              if (value) setDueFilter(value);
            }}
          >
            <ToggleButton value="all">{t('remindersPage.filterAll')}</ToggleButton>
            <ToggleButton value="today">{t('remindersPage.filterToday')}</ToggleButton>
            <ToggleButton value="week">{t('remindersPage.filterWeek')}</ToggleButton>
            <ToggleButton value="overdue">{t('remindersPage.filterOverdue')}</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      )}

      <Paper variant="outlined" sx={{ overflow: 'auto', mt: 2, bgcolor: 'background.paper' }}>
        {loading ? (
          <Typography sx={{ p: 3 }} color="text.secondary">
            {t('remindersPage.loading')}
          </Typography>
        ) : rows.length === 0 ? (
          <Typography sx={{ p: 3 }} color="text.secondary">
            {t('remindersPage.empty')}
          </Typography>
        ) : filteredRows.length === 0 ? (
          <Typography sx={{ p: 3 }} color="text.secondary">
            {t('remindersPage.noMatchFilter')}
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>{t('remindersPage.colTitle')}</TableCell>
                <TableCell>{t('remindersPage.colDue')}</TableCell>
                <TableCell>{t('remindersPage.colNotes')}</TableCell>
                <TableCell align="end">{t('remindersPage.colActions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    opacity: row.done ? 0.65 : 1,
                    textDecoration: row.done ? 'line-through' : 'none',
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={Boolean(row.done)}
                      onChange={() => toggleDone(row)}
                      inputProps={{ 'aria-label': t('remindersPage.markDone') }}
                    />
                  </TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.dueDate || '—'}</TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="body2" noWrap title={row.notes}>
                      {row.notes || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="end">
                    <IconButton size="small" onClick={() => openEdit(row)} aria-label="edit">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(row.id)}
                      aria-label="delete"
                      color="error"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? t('remindersPage.edit') : t('remindersPage.add')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label={t('remindersPage.fieldTitle')}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            fullWidth
            required
            margin="dense"
          />
          <TextField
            label={t('remindersPage.fieldDue')}
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label={t('remindersPage.fieldNotes')}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
            margin="dense"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>{t('drawer.cancel')}</Button>
          <Button variant="contained" onClick={handleSave}>
            {t('drawer.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RemindersPage;
