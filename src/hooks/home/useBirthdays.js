import { useMemo } from 'react';
import moment from 'moment';
import { filterStudentsByBirthMonth } from '../../utils/studentBirthdays';

/**
 * Active students with a date of birth in the current calendar month, sorted by day.
 */
export function useBirthdays(homeStudents) {
  const homeStudentsActiveOnly = useMemo(
    () => homeStudents.filter((studentRow) => studentRow.active !== false),
    [homeStudents]
  );

  const birthdaysThisMonth = useMemo(() => {
    const monthIndex = moment().month();
    const list = filterStudentsByBirthMonth(homeStudentsActiveOnly, monthIndex);
    return [...list].sort(
      (a, b) => moment(a.dateOfBirth).date() - moment(b.dateOfBirth).date()
    );
  }, [homeStudentsActiveOnly]);

  return { birthdaysThisMonth };
}
