import React from 'react';
import { Box, Button, Paper, TextField } from '@mui/material';
import PageHeader from '../../components/PageHeader';
import { useEditProfile } from '../../hooks/editProfile';

const EditProfilePage = () => {
  const {
    avatarUrl,
    email,
    handleSubmit,
    name,
    saving,
    setAvatarUrl,
    setEmail,
    setName,
  } = useEditProfile();

  return (
    <Box sx={{ maxWidth: 440, mx: 'auto' }}>
      <PageHeader
        title="Edit profile"
        subtitle="Update your display name, email, and optional avatar image URL."
      />
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Avatar image URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            helperText="Optional. Leave empty to use your initial in the menu."
          />
          <Button type="submit" variant="contained" disabled={saving} sx={{ mt: 2 }}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditProfilePage;
