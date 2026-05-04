import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteTimetableClassGroup,
  deleteTimetableGrade,
  getTimetableConfig,
  patchTimetableClassGroup,
  patchTimetableGrade,
  postTimetableClassGroup,
  postTimetableGrade,
} from '../../api/api';
import ShowToast from '../../components/ShowToast';
import { useLanguage } from '../../providers/LanguageProvider';

export function useGradesClasses() {
  const { t } = useLanguage();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newGradeName, setNewGradeName] = useState('');
  const [newSectionNames, setNewSectionNames] = useState({});
  const [editGradeId, setEditGradeId] = useState(null);
  const [editGradeName, setEditGradeName] = useState('');
  const [editCgId, setEditCgId] = useState(null);
  const [editCgName, setEditCgName] = useState('');
  const [editCgGradeId, setEditCgGradeId] = useState('');

  const loadConfig = useCallback(() => {
    return getTimetableConfig()
      .then((response) => {
        setConfig(response.data);
        return response.data;
      })
      .catch((error) => {
        ShowToast('error', error?.response?.data?.message || t('gradesClassesPage.loadError'));
        return null;
      });
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadConfig().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loadConfig]);

  const grades = config?.grades || [];

  const sectionsGroupedByGradeId = useMemo(() => {
    const gradeList = config?.grades || [];
    const allClassGroups = config?.classGroups || [];
    const sectionsByGrade = new Map();
    gradeList.forEach((grade) => {
      sectionsByGrade.set(grade.id, []);
    });
    allClassGroups.forEach((classGroup) => {
      const gradeId = Number(classGroup.gradeId);
      if (!sectionsByGrade.has(gradeId)) {
        sectionsByGrade.set(gradeId, []);
      }
      sectionsByGrade.get(gradeId).push(classGroup);
    });
    sectionsByGrade.forEach((sectionList) => {
      sectionList.sort((sectionA, sectionB) =>
        String(sectionA.name).localeCompare(String(sectionB.name))
      );
    });
    return sectionsByGrade;
  }, [config]);

  const refreshAfterAdmin = useCallback(() => {
    loadConfig();
  }, [loadConfig]);

  const handleAddGrade = useCallback(() => {
    const name = newGradeName.trim();
    if (!name) return;
    postTimetableGrade({ name })
      .then(() => {
        setNewGradeName('');
        ShowToast('success', t('timetablePage.created'));
        refreshAfterAdmin();
      })
      .catch((error) => {
        ShowToast('error', error?.response?.data?.message || t('timetablePage.saveError'));
      });
  }, [newGradeName, refreshAfterAdmin, t]);

  const saveEditedGrade = useCallback(
    (gradeId) => {
      patchTimetableGrade(gradeId, { name: editGradeName.trim() })
        .then(() => {
          setEditGradeId(null);
          ShowToast('success', t('timetablePage.saved'));
          refreshAfterAdmin();
        })
        .catch((error) => {
          ShowToast('error', error?.response?.data?.message || t('timetablePage.saveError'));
        });
    },
    [editGradeName, refreshAfterAdmin, t]
  );

  const deleteGrade = useCallback(
    (gradeId) => {
      if (!window.confirm(t('timetablePage.confirmDeleteGrade'))) return;
      deleteTimetableGrade(gradeId)
        .then(() => {
          ShowToast('success', t('timetablePage.deleted'));
          refreshAfterAdmin();
        })
        .catch((error) => {
          ShowToast('error', error?.response?.data?.message || t('timetablePage.deleteError'));
        });
    },
    [refreshAfterAdmin, t]
  );

  const addSectionForGrade = useCallback(
    (gradeId) => {
      const name = (newSectionNames[gradeId] || '').trim();
      if (!name) return;
      postTimetableClassGroup({ gradeId: Number(gradeId), name })
        .then(() => {
          setNewSectionNames((previousNames) => ({ ...previousNames, [gradeId]: '' }));
          ShowToast('success', t('timetablePage.created'));
          refreshAfterAdmin();
        })
        .catch((error) => {
          ShowToast('error', error?.response?.data?.message || t('timetablePage.saveError'));
        });
    },
    [newSectionNames, refreshAfterAdmin, t]
  );

  const saveEditedClassGroup = useCallback(
    (classGroupId) => {
      patchTimetableClassGroup(classGroupId, {
        name: editCgName.trim(),
        gradeId: Number(editCgGradeId),
      })
        .then(() => {
          setEditCgId(null);
          ShowToast('success', t('timetablePage.saved'));
          refreshAfterAdmin();
        })
        .catch((error) => {
          ShowToast('error', error?.response?.data?.message || t('timetablePage.saveError'));
        });
    },
    [editCgGradeId, editCgName, refreshAfterAdmin, t]
  );

  const deleteClassGroup = useCallback(
    (classGroupId) => {
      if (!window.confirm(t('timetablePage.confirmDeleteClass'))) return;
      deleteTimetableClassGroup(classGroupId)
        .then(() => {
          ShowToast('success', t('timetablePage.deleted'));
          refreshAfterAdmin();
        })
        .catch((error) => {
          ShowToast('error', error?.response?.data?.message || t('timetablePage.deleteError'));
        });
    },
    [refreshAfterAdmin, t]
  );

  return {
    addSectionForGrade,
    config,
    deleteClassGroup,
    deleteGrade,
    editCgGradeId,
    editCgId,
    editCgName,
    editGradeId,
    editGradeName,
    grades,
    handleAddGrade,
    loading,
    newGradeName,
    newSectionNames,
    sectionsGroupedByGradeId,
    setEditCgGradeId,
    setEditCgId,
    setEditCgName,
    setEditGradeId,
    setEditGradeName,
    setNewGradeName,
    setNewSectionNames,
    saveEditedClassGroup,
    saveEditedGrade,
  };
}

export default useGradesClasses;
