import React from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import AppDataTable from '../../components/AppDataTable';
import PageHeader from '../../components/PageHeader';
import AppDrawer from '../../components/AppDrawer';
import { useAdminUsers } from '../../hooks/adminUsers';
import { useLanguage } from '../../providers/LanguageProvider';

const AdminUsersPage = () => {
  const { t } = useLanguage();
  const {
    closeDrawer,
    columns,
    filteredRows,
    form,
    handleSave,
    open,
    roleFilter,
    setForm,
    setRoleFilter,
    students,
  } = useAdminUsers();

  return (
    <Box sx={{ width: 1 }}>
      <PageHeader
        title={t('adminUsersPage.title')}
        subtitle={t('adminUsersPage.subtitleAllAccounts')}
      />
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={roleFilter}
          onChange={(_event, next) => {
            if (next != null) setRoleFilter(next);
          }}
          aria-label="role filter"
        >
          <ToggleButton value="all">{t('adminUsersPage.roleFilterAll')}</ToggleButton>
          <ToggleButton value="admin">{t('adminUsersPage.roleFilterAdmin')}</ToggleButton>
          <ToggleButton value="teacher">{t('adminUsersPage.roleFilterTeacher')}</ToggleButton>
          <ToggleButton value="student">{t('adminUsersPage.roleFilterStudent')}</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <AppDataTable
        columns={columns}
        rows={filteredRows}
        getRowId={(u) => u.id ?? u.ID}
        emptyMessage={t('table.noUsers')}
      />

      <AppDrawer
        open={open}
        onClose={closeDrawer}
        title={t('adminUsersPage.editUser')}
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
            label={t('table.name')}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            fullWidth
            required
          />
          <TextField
            label={t('table.email')}
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            fullWidth
            required
          />
          <TextField
            select
            label={t('table.role')}
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value, studentId: '' })}
            fullWidth
          >
            <MenuItem value="admin">{t('login.admin')}</MenuItem>
            <MenuItem value="teacher">{t('login.teacher')}</MenuItem>
            <MenuItem value="student">{t('login.student')}</MenuItem>
          </TextField>
          {form.role === 'student' && (
            <TextField
              select
              label={t('table.studentLink')}
              value={form.studentId}
              onChange={(event) => setForm({ ...form, studentId: event.target.value })}
              fullWidth
              required
            >
              <MenuItem value="">
                <em>{t('parentsPage.selectStudent')}</em>
              </MenuItem>
              {students.map((studentRow) => (
                <MenuItem key={studentRow.id} value={String(studentRow.id)}>
                  {studentRow.firstName} {studentRow.lastName} (#{studentRow.id})
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            label={t('adminUsersPage.newPasswordOptional')}
            type="password"
            value={form.newPassword}
            onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
            fullWidth
            helperText={t('adminUsersPage.newPasswordHint')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.active}
                onChange={(event) => setForm({ ...form, active: event.target.checked })}
              />
            }
            label={t('table.active')}
          />
        </Box>
      </AppDrawer>
    </Box>
  );
};

export default AdminUsersPage;
