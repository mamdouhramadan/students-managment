import { Navigate, useRoutes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import StudentsPage from '../pages/StudentsPage';
import ParentsPage from '../pages/ParentsPage';
import EditProfilePage from '../pages/EditProfilePage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import TeachersAdminPage from '../pages/TeachersAdminPage';
import SiteSettingsPage from '../pages/SiteSettingsPage';
import RemindersPage from '../pages/RemindersPage';
import TimetablePage from '../pages/TimetablePage';
import GradesClassesPage from '../pages/GradesClassesPage';
import CoursesAdminPage from '../pages/CoursesAdminPage';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

/**
 * React Router v6 route objects for useRoutes.
 * Order matters: `/login` before the protected layout; `*` last.
 */
export const appRoutes = [
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'students', element: <StudentsPage /> },
          { path: 'parents', element: <ParentsPage /> },
          { path: 'reminders', element: <RemindersPage /> },
          { path: 'timetable', element: <TimetablePage /> },
          { path: 'profile', element: <EditProfilePage /> },
          { path: 'profile/password', element: <ChangePasswordPage /> },
          {
            element: <AdminRoute />,
            children: [
              { path: 'admin/users', element: <AdminUsersPage /> },
              { path: 'admin/teachers', element: <TeachersAdminPage /> },
              { path: 'admin/settings', element: <SiteSettingsPage /> },
              { path: 'admin/grades-classes', element: <GradesClassesPage /> },
              { path: 'admin/courses', element: <CoursesAdminPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export function AppRoutes() {
  return useRoutes(appRoutes);
}
