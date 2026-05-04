import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { getMe } from '../api/api';
import { userActions } from '../helpers';
import { useAuth } from '../hooks/useAuth';

/**
 * Requires Flux `isAuthenticated`; validates session (active user) via GET /api/me.
 */
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const checked = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      checked.current = false;
      return;
    }
    if (checked.current) return;
    checked.current = true;
    getMe()
      .then(({ data }) => {
        if (data) userActions.updateAuthUser(data);
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 403 || status === 401) {
          const msg = err?.response?.data?.message;
          userActions.logout();
          navigate('/login', { replace: true, state: { message: msg } });
        }
      });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
