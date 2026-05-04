import moment from 'moment';

/**
 * Students whose dateOfBirth falls in the given calendar month (0–11).
 * Invalid or missing dates are excluded.
 */
export function filterStudentsByBirthMonth(students, monthIndex) {
  if (!Array.isArray(students) || monthIndex < 0 || monthIndex > 11) return [];
  return students.filter((student) => {
    const dob = student?.dateOfBirth;
    if (!dob) return false;
    const date = moment(dob);
    if (!date.isValid()) return false;
    return date.month() === monthIndex;
  });
}
