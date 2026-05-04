import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import AddIcon from '@mui/icons-material/Add';
import AppDataTable from '../../components/AppDataTable';
import PageHeader from '../../components/PageHeader';
import AppDrawer from '../../components/AppDrawer';
import { useParents } from '../../hooks/parents';
import { useLanguage } from '../../providers/LanguageProvider';

const ParentsPage = () => {
  const { t } = useLanguage();
  const {
    canCreate,
    closeDrawer,
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
  } = useParents();

  const parentsEmptyOnboarding = (
    <Paper
      variant="outlined"
      sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderColor: 'divider' }}
    >
      <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
        {t('parentsPage.emptyOnboarding')}
      </Typography>
      <Button component={RouterLink} to="/students" variant="contained">
        {t('parentsPage.goToStudents')}
      </Button>
    </Paper>
  );

  return (
    <Box sx={{ width: 1 }}>
      <PageHeader
        title={t('parentsPage.title')}
        subtitle={t('parentsPage.subtitle')}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              onClick={handleExportParentsCsv}
              disabled={!filteredParents.length}
            >
              {t('parentsPage.exportCsv')}
            </Button>
            {canCreate ? (
              <Button startIcon={<AddIcon />} variant="contained" onClick={openNew}>
                {t('parentsPage.addParent')}
              </Button>
            ) : null}
          </Stack>
        }
      />
      <Box sx={{ mb: 2, maxWidth: 400 }}>
        <TextField
          size="small"
          fullWidth
          placeholder={t('parentsPage.searchPlaceholder')}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <AppDataTable
        columns={columns}
        rows={filteredParents}
        getRowId={(p) => p.id}
        emptyMessage={
          parents.length ? t('parentsPage.noMatchFilter') : t('table.noParents')
        }
        emptySlot={parents.length === 0 ? parentsEmptyOnboarding : undefined}
      />

      <AppDrawer
        open={open}
        onClose={closeDrawer}
        title={editingId ? t('parentsPage.editParent') : t('parentsPage.addParent')}
        size="md"
        footer={
          <>
            <Button color="inherit" variant="outlined" onClick={closeDrawer}>
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
          />
          <TextField
            label={t('table.lastName')}
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label={t('table.email')}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            fullWidth
          />
          <TextField
            label={t('table.phone')}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            fullWidth
          />
          <TextField
            select
            label={t('table.student')}
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            fullWidth
            required
          >
            <MenuItem value="">
              <em>{t('parentsPage.selectStudent')}</em>
            </MenuItem>
            {students.map((s) => (
              <MenuItem key={s.id} value={String(s.id)}>
                {s.firstName} {s.lastName} (#{s.id})
              </MenuItem>
            ))}
          </TextField>
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

export default ParentsPage;
