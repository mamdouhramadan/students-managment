import { useCallback, useEffect, useState } from 'react';
import { deleteCourse, getCourses, patchCourse, postCourse } from '../../api/api';
import ShowToast from '../../components/ShowToast';
import { useLanguage } from '../../providers/LanguageProvider';

export function useCourses() {
  const { t } = useLanguage();
  const [catalogCourses, setCatalogCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingCourseName, setEditingCourseName] = useState('');
  const [editingCourseCode, setEditingCourseCode] = useState('');

  const loadCatalogFromServer = useCallback(() => {
    return getCourses()
      .then((response) => setCatalogCourses(response.data || []))
      .catch((error) => {
        ShowToast('error', error?.response?.data?.message || t('coursesPage.loadError'));
      });
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadCatalogFromServer().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loadCatalogFromServer]);

  const handleAddCourse = useCallback(() => {
    const trimmedName = newCourseName.trim();
    if (!trimmedName) return;

    postCourse({ name: trimmedName, code: newCourseCode.trim() })
      .then(() => {
        setNewCourseName('');
        setNewCourseCode('');
        ShowToast('success', t('coursesPage.created'));
        loadCatalogFromServer();
      })
      .catch((error) => {
        ShowToast('error', error?.response?.data?.message || t('coursesPage.saveError'));
      });
  }, [loadCatalogFromServer, newCourseCode, newCourseName, t]);

  const beginEditCourse = useCallback((courseRow) => {
    setEditingCourseId(courseRow.id);
    setEditingCourseName(courseRow.name);
    setEditingCourseCode(courseRow.code || '');
  }, []);

  const saveEditedCourse = useCallback(() => {
    if (editingCourseId == null) return;

    const trimmedName = editingCourseName.trim();
    if (!trimmedName) return;

    patchCourse(editingCourseId, { name: trimmedName, code: editingCourseCode.trim() })
      .then(() => {
        setEditingCourseId(null);
        ShowToast('success', t('coursesPage.saved'));
        loadCatalogFromServer();
      })
      .catch((error) => {
        ShowToast('error', error?.response?.data?.message || t('coursesPage.saveError'));
      });
  }, [editingCourseCode, editingCourseId, editingCourseName, loadCatalogFromServer, t]);

  const cancelEditCourse = useCallback(() => setEditingCourseId(null), []);

  const deleteCourseById = useCallback(
    (courseId) => {
      if (!window.confirm(t('coursesPage.confirmDelete'))) return;
      deleteCourse(courseId)
        .then(() => {
          ShowToast('success', t('coursesPage.deleted'));
          loadCatalogFromServer();
        })
        .catch((error) => {
          ShowToast('error', error?.response?.data?.message || t('coursesPage.deleteError'));
        });
    },
    [loadCatalogFromServer, t]
  );

  return {
    beginEditCourse,
    cancelEditCourse,
    catalogCourses,
    deleteCourseById,
    editingCourseCode,
    editingCourseId,
    editingCourseName,
    handleAddCourse,
    loading,
    newCourseCode,
    newCourseName,
    saveEditedCourse,
    setEditingCourseCode,
    setEditingCourseName,
    setNewCourseCode,
    setNewCourseName,
  };
}

export default useCourses;
