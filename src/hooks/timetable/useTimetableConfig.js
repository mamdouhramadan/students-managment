import { useCallback, useEffect, useState } from 'react';
import { getTimetableConfig } from '../../api/api';
import ShowToast from '../../components/ShowToast';
import { useLanguage } from '../../providers/LanguageProvider';

export function useTimetableConfig() {
  const { t } = useLanguage();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadConfig = useCallback(() => {
    return getTimetableConfig()
      .then((response) => {
        setConfig(response.data);
        return response.data;
      })
      .catch((error) => {
        ShowToast(
          'error',
          error?.response?.data?.message || t('timetablePage.loadConfigError')
        );
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

  return { config, loading };
}

export default useTimetableConfig;
