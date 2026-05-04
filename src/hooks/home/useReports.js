import { useEffect, useState } from 'react';
import { getAdminStats } from '../../api/api';
import ShowToast from '../../components/ShowToast';
import { useAuth } from '../useAuth';

/**
 * Loads admin analytics payload for the home reports block (admins only).
 */
export function useReports(translate) {
  const { isAdmin } = useAuth();
  const [adminSnapshot, setAdminSnapshot] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!isAdmin) {
      setAdminSnapshot(null);
      return undefined;
    }
    getAdminStats()
      .then(({ data }) => {
        if (!cancelled) setAdminSnapshot(data);
      })
      .catch((error) => {
        if (!cancelled) {
          setAdminSnapshot(null);
          ShowToast(
            'error',
            error?.response?.data?.message || translate('reports.loadError')
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, translate]);

  return { adminSnapshot };
}
