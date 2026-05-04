import { useUserStore } from '../flux/useStores';

export function useAuth() {
  const { authUser, permission = [], isAuthenticated } = useUserStore();
  const role = authUser?.role || null;

  return {
    authUser,
    permission,
    isAuthenticated,
    role,
    isAdmin: role === 'admin',
    isTeacher: role === 'teacher',
    isStudent: role === 'student',
    isStaff: role === 'teacher' || role === 'admin',
    canView: permission.includes('view'),
    canCreate: permission.includes('create'),
    canEdit: permission.includes('edit'),
    canDelete: permission.includes('delete'),
  };
}

export default useAuth;
