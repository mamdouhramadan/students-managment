import React, { useEffect, useMemo, useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { getTimetableConfig } from '../../api/api';
import { useLanguage } from '../../providers/LanguageProvider';

function labelForClass(classGroup, grades) {
  const grade = (grades || []).find((g) => Number(g.id) === Number(classGroup.gradeId));
  return grade?.name ? `${grade.name} — ${classGroup.name}` : classGroup.name;
}

/**
 * Assigns a student to a class section (`classGroupId` on the student record).
 * UX: choose **grade**, then **section** within that grade (filtered list).
 */
export default function StudentClassGroupField({ value, onChange, readOnly }) {
  const { t } = useLanguage();
  const [grades, setGrades] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  /** Keeps grade dropdown in sync when `classGroupId` is cleared but user is still picking a section */
  const [gradePickerValue, setGradePickerValue] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTimetableConfig()
      .then((response) => {
        if (cancelled) return;
        setGrades(response.data?.grades || []);
        setClassGroups(response.data?.classGroups || []);
      })
      .catch(() => {
        if (!cancelled) {
          setGrades([]);
          setClassGroups([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedClassGroupId =
    value === null || value === undefined || value === '' ? '' : String(value);

  const resolvedClassGroup = useMemo(
    () => classGroups.find((cg) => String(cg.id) === selectedClassGroupId),
    [classGroups, selectedClassGroupId]
  );

  useEffect(() => {
    if (resolvedClassGroup) {
      setGradePickerValue(String(resolvedClassGroup.gradeId));
    } else if (!selectedClassGroupId) {
      setGradePickerValue('');
    }
  }, [resolvedClassGroup, selectedClassGroupId]);

  const sectionsInSelectedGrade = useMemo(() => {
    if (!gradePickerValue) return [];
    const gradeIdNum = Number(gradePickerValue);
    return classGroups.filter((cg) => Number(cg.gradeId) === gradeIdNum);
  }, [classGroups, gradePickerValue]);

  const readOnlyLabel = () => {
    if (loading) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {t('studentsPage.classGroup')}: …
        </Typography>
      );
    }
    const classGroup = classGroups.find((cg) => String(cg.id) === selectedClassGroupId);
    return (
      <Typography variant="body2" sx={{ mt: 2 }}>
        <strong>{t('studentsPage.classGroup')}:</strong>{' '}
        {classGroup ? labelForClass(classGroup, grades) : t('studentsPage.classGroupNone')}
      </Typography>
    );
  };

  if (readOnly) {
    return readOnlyLabel();
  }

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <FormControl fullWidth margin="normal" size="small" disabled={loading}>
        <InputLabel id="student-grade">{t('studentsPage.grade')}</InputLabel>
        <Select
          labelId="student-grade"
          label={t('studentsPage.grade')}
          value={gradePickerValue}
          onChange={(event) => {
            const next = event.target.value;
            setGradePickerValue(next);
            if (next === '') {
              onChange(null);
              return;
            }
            onChange(null);
          }}
        >
          <MenuItem value="">
            <em>{t('studentsPage.classGroupNone')}</em>
          </MenuItem>
          {grades.map((grade) => (
            <MenuItem key={grade.id} value={String(grade.id)}>
              {grade.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" size="small" disabled={loading || !gradePickerValue}>
        <InputLabel id="student-section">{t('studentsPage.section')}</InputLabel>
        <Select
          labelId="student-section"
          label={t('studentsPage.section')}
          value={selectedClassGroupId}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw === '') onChange(null);
            else onChange(Number(raw));
          }}
        >
          <MenuItem value="">
            <em>{t('studentsPage.chooseSection')}</em>
          </MenuItem>
          {sectionsInSelectedGrade.map((classGroup) => (
            <MenuItem key={classGroup.id} value={String(classGroup.id)}>
              {classGroup.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
