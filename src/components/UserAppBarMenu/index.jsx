import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import { userActions } from '../../helpers';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../providers/LanguageProvider';

function userInitial(authUser) {
  const s = (authUser?.name || authUser?.email || '?').trim();
  return s ? s[0].toUpperCase() : '?';
}

const UserAppBarMenu = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const { t } = useLanguage();
  const [anchor, setAnchor] = useState(null);
  const [imgError, setImgError] = useState(false);
  const open = Boolean(anchor);
  const hasAvatar = Boolean(authUser?.avatarUrl) && !imgError;

  useEffect(() => {
    setImgError(false);
  }, [authUser?.avatarUrl]);

  const handleOpen = (e) => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);

  const go = (path) => {
    handleClose();
    navigate(path);
  };

  const logout = () => {
    handleClose();
    userActions.logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <Box
        onClick={handleOpen}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          borderRadius: 1,
          px: 0.5,
          py: 0.25,
          '&:hover': { bgcolor: 'action.hover' },
        }}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          alt=""
          src={hasAvatar ? authUser.avatarUrl : undefined}
          sx={{ width: 36, height: 36, fontSize: '0.95rem' }}
          imgProps={{
            onError: () => setImgError(true),
          }}
        >
          {!hasAvatar ? userInitial(authUser) : null}
        </Avatar>
        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'start', minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{  mb: -0.85, maxWidth: 160 }}>
            {authUser?.name || authUser?.email}
          </Typography>
          <Typography variant="caption"  sx={{textTransform: 'capitalize', lineHeight: 0,textAlign: 'start' }}>
            {authUser?.role}
          </Typography>
        </Box>
        <KeyboardArrowDownIcon sx={{ fontSize: 20, opacity: 0.85, display: { xs: 'none', sm: 'block' } }} />
      </Box>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 200, mt: 1 } }}
      >
        <MenuItem onClick={() => go('/profile')}>
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          {t('userMenu.editProfile')}
        </MenuItem>
        {/* <MenuItem onClick={() => go('/profile/password')}>
          <ListItemIcon>
            <LockOutlinedIcon fontSize="small" />
          </ListItemIcon>
          {t('userMenu.changePassword')}
        </MenuItem> */}
        <Divider />
        <MenuItem sx={{ color: 'error.main' }} onClick={logout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {t('userMenu.logout')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserAppBarMenu;
