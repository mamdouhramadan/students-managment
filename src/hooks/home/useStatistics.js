import { useEffect, useState } from 'react';
import { getStudents, getParents } from '../../api/api';
import { useAuth } from '../useAuth';

/**
 * Loads student and parent lists for the home dashboard and derives headline counts.
 * Student accounts only see their own student row and related parents.
 */
export function useStatistics() {
  const { authUser, isStudent } = useAuth();
  const [stats, setStats] = useState({ students: 0, parents: 0 });
  const [homeStudents, setHomeStudents] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getStudents(), getParents()])
      .then(([studentsResponse, parentsResponse]) => {
        if (cancelled) return;
        let studentList = studentsResponse.data || [];
        let parentList = parentsResponse.data || [];
        if (isStudent && authUser?.studentId) {
          studentList = studentList.filter((studentRow) => studentRow.id === authUser.studentId);
          parentList = parentList.filter((parentRow) => parentRow.studentId === authUser.studentId);
        }
        setStats({ students: studentList.length, parents: parentList.length });
        setHomeStudents(studentList);
      })
      .catch(() => {
        if (!cancelled) setHomeStudents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [authUser, isStudent]);

  return { stats, homeStudents };
}
