import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { getAdminSiteSettings, patchAdminSiteSettings } from '../../api/api';
import ShowToast from '../../components/ShowToast';
import { useLanguage } from '../../providers/LanguageProvider';
import { useThemeColor } from '../../providers/ThemeColorProvider';
import { useThemeMode } from '../../providers/ThemeModeProvider';
import { parseWeekendDays } from '../../utils/timetableCalendar';

const defaultForm = {
  schoolName: '',
  schoolTagline: '',
  supportPhone: '',
  academicYear: '',
  timezone: '',
  announcement: '',
  contactEmail: '',
  admissionsEmail: '',
  smtpHost: '',
  smtpPort: '',
  smtpSecure: 'true',
  smtpUser: '',
  emailFromName: '',
  emailFromAddress: '',
  emailReplyTo: '',
  emailSignature: '',
  primaryColorHex: '#8854d0',
  density: 'default',
  timetableWeekStartDay: 'sun',
  timetableWeekendDays: '["fri","sat"]',
};

const SETTINGS_TAB_KEYS = ['general', 'email', 'theme', 'schedule'];
const GENERAL_SETTING_KEYS = [
  'schoolName',
  'schoolTagline',
  'supportPhone',
  'academicYear',
  'timezone',
  'announcement',
];
const EMAIL_SETTING_KEYS = [
  'contactEmail',
  'admissionsEmail',
  'smtpHost',
  'smtpPort',
  'smtpSecure',
  'smtpUser',
  'emailFromName',
  'emailFromAddress',
  'emailReplyTo',
  'emailSignature',
];
const THEME_SITE_KEYS = ['primaryColorHex', 'density'];
const SCHEDULE_SETTING_KEYS = ['timetableWeekStartDay', 'timetableWeekendDays'];

function formWithDefaults(base, keys) {
  const next = { ...base };
  keys.forEach((key) => {
    next[key] = defaultForm[key];
  });
  return next;
}

export function useSiteSettings() {
  const { t } = useLanguage();
  const { setBrandColor } = useThemeColor();
  const { preference, setPreferenceMode } = useThemeMode();
  const [form, setForm] = useState(defaultForm);
  const [tabQuery, setTabQuery] = useQueryState(
    'tab',
    parseAsStringLiteral(SETTINGS_TAB_KEYS).withDefault('general')
  );
  const tabIndex = Math.max(0, SETTINGS_TAB_KEYS.indexOf(tabQuery));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const tabPrefix = 'site-settings';

  useEffect(() => {
    let cancelled = false;
    getAdminSiteSettings()
      .then(({ data }) => {
        if (cancelled || !data) return;
        const merged = { ...defaultForm, ...data };
        delete merged.themeMode;
        setForm(merged);
      })
      .catch((error) => {
        ShowToast('error', error?.response?.data?.message || t('settings.loadError'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleChange = useCallback(
    (field) => (event) => {
      setForm((previousForm) => ({ ...previousForm, [field]: event.target.value }));
    },
    []
  );

  const handleSelect = useCallback(
    (field) => (event) => {
      setForm((previousForm) => ({ ...previousForm, [field]: event.target.value }));
    },
    []
  );

  const toggleWeekendDay = useCallback(
    (dayId) => {
      const weekendDays = parseWeekendDays(form.timetableWeekendDays);
      const dayIndex = weekendDays.indexOf(dayId);
      let nextWeekendDays;
      if (dayIndex >= 0) {
        nextWeekendDays = weekendDays.filter((_, index) => index !== dayIndex);
      } else if (weekendDays.length >= 3) {
        ShowToast('error', t('settings.weekendMaxError'));
        return;
      } else {
        nextWeekendDays = [...weekendDays, dayId];
      }
      setForm((previousForm) => ({
        ...previousForm,
        timetableWeekendDays: JSON.stringify(nextWeekendDays),
      }));
    },
    [form.timetableWeekendDays, t]
  );

  const persistToServer = useCallback(
    (nextForm) => {
      setSaving(true);
      const { themeMode: _omitThemeMode, ...payload } = nextForm;
      patchAdminSiteSettings(payload)
        .then(({ data }) => {
          ShowToast('success', t('settings.saved'));
          if (data) {
            const merged = { ...defaultForm, ...data };
            if (merged.themeMode !== undefined) delete merged.themeMode;
            setForm(merged);
          }
          if (data?.primaryColorHex) setBrandColor(data.primaryColorHex);
        })
        .catch((error) => {
          ShowToast('error', error?.response?.data?.message || t('settings.saveError'));
        })
        .finally(() => setSaving(false));
    },
    [setBrandColor, t]
  );

  const handleSave = useCallback(() => {
    persistToServer(form);
  }, [form, persistToServer]);

  const resetAndSave = useCallback(
    (keys, confirmKey) => {
      if (!window.confirm(t(confirmKey))) return;
      const nextForm = { ...formWithDefaults(form, keys), id: form.id };
      setForm(nextForm);
      persistToServer(nextForm);
    },
    [form, persistToServer, t]
  );

  const resetAllAndSave = useCallback(() => {
    if (!window.confirm(t('settings.confirmResetAll'))) return;
    const nextForm = { ...defaultForm, id: form.id };
    setForm(nextForm);
    persistToServer(nextForm);
  }, [form.id, persistToServer, t]);

  const handleTabChange = useCallback(
    (_event, value) => {
      void setTabQuery(SETTINGS_TAB_KEYS[value]);
    },
    [setTabQuery]
  );

  const colorValid = useMemo(
    () => /^#[0-9A-Fa-f]{6}$/.test(form.primaryColorHex || ''),
    [form.primaryColorHex]
  );

  return {
    colorValid,
    form,
    handleChange,
    handleSave,
    handleSelect,
    handleTabChange,
    loading,
    preference,
    resetAllAndSave,
    resetEmailSettings: () => resetAndSave(EMAIL_SETTING_KEYS, 'settings.confirmResetEmail'),
    resetGeneralSettings: () =>
      resetAndSave(GENERAL_SETTING_KEYS, 'settings.confirmResetGeneral'),
    resetScheduleSettings: () =>
      resetAndSave(SCHEDULE_SETTING_KEYS, 'settings.confirmResetSchedule'),
    resetThemeSettings: () => resetAndSave(THEME_SITE_KEYS, 'settings.confirmResetTheme'),
    saving,
    setForm,
    setPreferenceMode,
    tabIndex,
    tabPrefix,
    toggleWeekendDay,
  };
}

export default useSiteSettings;
