import React, { useState } from 'react';
import { Box, Button, Paper, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { changeMyPassword } from '../../api/api';
import ShowToast from '../../components/ShowToast';
import PageHeader from '../../components/PageHeader';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      ShowToast('error', 'New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await changeMyPassword({ currentPassword, newPassword });
      ShowToast('success', 'Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Could not change password';
      ShowToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 440, mx: 'auto' }}>
      <PageHeader
        title="Change password"
        subtitle="Enter your current password, then choose a new one."
      />
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <TextField
            fullWidth
            margin="normal"
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Button type="submit" variant="contained" disabled={saving} sx={{ mt: 2 }}>
            {saving ? 'Updating…' : 'Update password'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChangePasswordPage;
