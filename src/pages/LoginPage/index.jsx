import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { loginRequest } from '../../api/api';
import { userActions } from '../../helpers';
import { useAuth } from '../../hooks/useAuth';
import ShowToast from '../../components/ShowToast';
import SiteLogo from '../../components/SiteLogo';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import ThemeModeToggle from '../../components/ThemeModeToggle';
import { useLanguage } from '../../providers/LanguageProvider';

const isDev = process.env.NODE_ENV === 'development';

const DEMO_ACCOUNTS = [
  { roleKey: 'teacher', email: 'teacher@school.test', password: 'teacher123' },
  { roleKey: 'student', email: 'student@school.test', password: 'student123' },
  { roleKey: 'admin', email: 'admin@school.test', password: 'admin123' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('teacher@school.test');
  const [password, setPassword] = useState('teacher123');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const msg = location.state?.message;
    if (typeof msg === 'string' && msg) {
      setError(msg);
    }
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await loginRequest({ email, password });
      const token = data.accessToken ?? data.token;
      userActions.loginSuccess({ user: data.user, token });
      ShowToast('success', t('common.welcomeBack'));
      navigate('/', { replace: true });
    } catch (err) {
      const raw = err?.response?.data;
      const msg =
        typeof raw === 'string'
          ? raw
          : raw?.message || err?.message || t('common.loginFailed');
      setError(msg);
      ShowToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          insetInlineEnd: 16,
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <ThemeModeToggle />
        <LanguageSwitcher />
      </Box>
      <Card elevation={3} sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <SiteLogo />
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
              {t('login.signIn')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 320, mx: 'auto' }}>
              {t('login.subtitle')}
            </Typography>
          </Box>

          {isDev && (
            <Alert severity="info" icon={false} sx={{ mb: 2, textAlign: 'left' }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                {t('login.demoCredentials')}
              </Typography>
              {DEMO_ACCOUNTS.map((a) => (
                <Box
                  key={a.roleKey}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    flexWrap: 'wrap',
                    py: 0.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    '&:first-of-type': { borderTop: 'none', pt: 0 },
                  }}
                >
                  <Typography variant="body2" component="span" sx={{ flex: '1 1 200px' }}>
                    <strong>{t(`login.${a.roleKey}`)}:</strong> {a.email} / {a.password}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setEmail(a.email);
                      setPassword(a.password);
                    }}
                  >
                    {t('login.use')}
                  </Button>
                </Box>
              ))}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label={t('login.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label={t('login.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={<LoginIcon />}
              sx={{ mt: 3 }}
            >
              {submitting ? t('login.signingIn') : t('login.submit')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
