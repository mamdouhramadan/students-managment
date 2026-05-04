import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getStudentsDetails } from '../../api/getStudentAPI';

export function useOpenStudent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const openStudentParam = searchParams.get('openStudent');

  useEffect(() => {
    if (!openStudentParam) return;

    const id = Number(openStudentParam);
    if (!Number.isFinite(id) || id < 1) {
      setSearchParams(
        (previousParams) => {
          const nextParams = new URLSearchParams(previousParams);
          nextParams.delete('openStudent');
          return nextParams;
        },
        { replace: true }
      );
      return;
    }

    let cancelled = false;
    getStudentsDetails(id, 'view').finally(() => {
      if (cancelled) return;
      setSearchParams(
        (previousParams) => {
          const nextParams = new URLSearchParams(previousParams);
          nextParams.delete('openStudent');
          return nextParams;
        },
        { replace: true }
      );
    });

    return () => {
      cancelled = true;
    };
  }, [openStudentParam, setSearchParams]);
}

export default useOpenStudent;
