import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { getStudentTags } from '../../api/api';
import { useLanguage } from '../../providers/LanguageProvider';

/**
 * Multi-select tags assigned to a student (`tagIds` synced with `studentTags` in the API).
 */
export default function StudentTagsField({ value, onChange, readOnly }) {
  const { t } = useLanguage();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getStudentTags()
      .then((res) => {
        if (!cancelled) setOptions(res.data || []);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = (options || []).filter((tagRow) => (value || []).includes(tagRow.id));

  return (
    <Autocomplete
      multiple
      options={options}
      getOptionLabel={(option) => option.name || ''}
      value={selected}
      onChange={(_, newValue) => onChange(newValue.map((tagRow) => tagRow.id))}
      disabled={readOnly}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('studentsPage.fieldTags')}
          placeholder={readOnly ? '' : t('studentsPage.fieldTagsPlaceholder')}
        />
      )}
    />
  );
}
