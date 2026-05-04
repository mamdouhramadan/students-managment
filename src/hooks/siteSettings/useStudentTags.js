import { useCallback, useEffect, useState } from 'react';
import { deleteStudentTag, getStudentTags, postStudentTag } from '../../api/api';
import ShowToast from '../../components/ShowToast';
import { useLanguage } from '../../providers/LanguageProvider';

export function useStudentTags() {
  const { t } = useLanguage();
  const [studentTagsList, setStudentTagsList] = useState([]);
  const [newTagName, setNewTagName] = useState('');

  const loadStudentTags = useCallback(() => {
    getStudentTags()
      .then((response) => setStudentTagsList(response.data || []))
      .catch(() => setStudentTagsList([]));
  }, []);

  useEffect(() => {
    loadStudentTags();
  }, [loadStudentTags]);

  const handleAddTag = useCallback(() => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) return;

    postStudentTag({ name: trimmedName })
      .then(() => {
        setNewTagName('');
        ShowToast('success', t('settings.saved'));
        loadStudentTags();
      })
      .catch((error) =>
        ShowToast('error', error?.response?.data?.message || t('settings.saveError'))
      );
  }, [loadStudentTags, newTagName, t]);

  const handleDeleteTag = useCallback(
    (tagId) => {
      if (!window.confirm(t('settings.tagDeleteConfirm'))) return;
      deleteStudentTag(tagId)
        .then(() => {
          ShowToast('success', t('settings.saved'));
          loadStudentTags();
        })
        .catch((error) =>
          ShowToast('error', error?.response?.data?.message || t('settings.saveError'))
        );
    },
    [loadStudentTags, t]
  );

  return {
    handleAddTag,
    handleDeleteTag,
    newTagName,
    setNewTagName,
    studentTagsList,
  };
}

export default useStudentTags;
