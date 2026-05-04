import { useCallback, useEffect, useState } from 'react';
import { patchMyProfile } from '../../api/api';
import ShowToast from '../../components/ShowToast';
import { userActions } from '../../helpers';
import { useAuth } from '../useAuth';

export function useEditProfile() {
  const { authUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    setName(authUser.name ?? '');
    setEmail(authUser.email ?? '');
    setAvatarUrl(authUser.avatarUrl ?? '');
  }, [authUser]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setSaving(true);
      try {
        const { data } = await patchMyProfile({
          name: name.trim(),
          email: email.trim(),
          avatarUrl: avatarUrl.trim() || null,
        });
        userActions.updateAuthUser(data);
        ShowToast('success', 'Profile saved');
      } catch (error) {
        const message =
          error?.response?.data?.message || error?.message || 'Could not save profile';
        ShowToast('error', message);
      } finally {
        setSaving(false);
      }
    },
    [avatarUrl, email, name]
  );

  return {
    avatarUrl,
    email,
    handleSubmit,
    name,
    saving,
    setAvatarUrl,
    setEmail,
    setName,
  };
}

export default useEditProfile;
