import { useMemo } from 'react';
import { readRecentStudentIds, resolveRecentStudents } from '../../utils/recentStudents';

/**
 * Resolves localStorage “recent student” ids against the current student list for home chips.
 */
export function useRecentStudents(homeStudents) {
  const recentStudentRows = useMemo(
    () => resolveRecentStudents(readRecentStudentIds(), homeStudents),
    [homeStudents]
  );

  return { recentStudentRows };
}
