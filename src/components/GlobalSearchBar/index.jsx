import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Autocomplete,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import FamilyRestroomOutlined from '@mui/icons-material/FamilyRestroomOutlined';
import { getParents, getStudents } from '../../api/api';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../providers/LanguageProvider';

function norm(s) {
  return (s == null ? '' : String(s)).trim().toLowerCase();
}

function studentLabel(s) {
  const n = `${s.firstName || ''} ${s.lastName || ''}`.trim();
  return n || `#${s.id ?? s.ID}`;
}

function buildOptions(students, parents) {
  const studOpts = (students || []).map((s) => {
    const id = s.id ?? s.ID;
    const label = studentLabel(s);
    const sub = s.email || '';
    const search = norm(`${s.firstName} ${s.lastName} ${s.email} ${label}`);
    return { kind: 'student', id, label, sub, search };
  });
  const parOpts = (parents || []).map((p) => {
    const id = p.id ?? p.ID;
    const label = `${p.firstName || ''} ${p.lastName || ''}`.trim() || `#${id}`;
    const sub = p.email || p.phone || '';
    const search = norm(`${p.firstName} ${p.lastName} ${p.email} ${p.phone} ${label}`);
    return { kind: 'parent', id, label, sub, search };
  });
  return [...studOpts, ...parOpts];
}

function filterOptions(all, qRaw) {
  const q = norm(qRaw);
  if (!q) return all.slice(0, 50);
  return all.filter(
    (o) =>
      o.search.includes(q) ||
      norm(o.label).includes(q) ||
      norm(o.sub).includes(q)
  );
}

export default function GlobalSearchBar() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('md'));
  const { authUser, isStudent } = useAuth();
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [input, setInput] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getStudents(), getParents()])
      .then(([sr, pr]) => {
        let sl = sr.data || [];
        let pl = pr.data || [];
        if (isStudent && authUser?.studentId != null) {
          sl = sl.filter((s) => (s.id ?? s.ID) === authUser.studentId);
          pl = pl.filter((p) => p.studentId === authUser.studentId);
        }
        setStudents(sl);
        setParents(pl);
      })
      .catch(() => {
        setStudents([]);
        setParents([]);
      })
      .finally(() => setLoading(false));
  }, [authUser?.studentId, isStudent]);

  useEffect(() => {
    load();
  }, [load]);

  const allOptions = useMemo(() => buildOptions(students, parents), [students, parents]);
  const options = useMemo(() => filterOptions(allOptions, input), [allOptions, input]);

  const onPick = useCallback(
    (_, v) => {
      if (!v) return;
      if (v.kind === 'student') {
        navigate(`/students?openStudent=${v.id}`);
      } else {
        navigate(`/parents?openParent=${v.id}`);
      }
      setInput('');
      setOpen(false);
      setMobileOpen(false);
    },
    [navigate]
  );

  const groupBy = (opt) =>
    opt.kind === 'student' ? t('globalSearch.groupStudents') : t('globalSearch.groupParents');

  const appBarSearchSx = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      bgcolor: alpha(theme.palette.primary.contrastText, 0.14),
      borderRadius: 2,
      transition: theme.transitions.create(['background-color', 'box-shadow'], {
        duration: theme.transitions.duration.shorter,
      }),
      '& fieldset': {
        borderColor: alpha(theme.palette.primary.contrastText, 0.38),
      },
      '&:hover': {
        bgcolor: alpha(theme.palette.primary.contrastText, 0.2),
      },
      '&:hover fieldset': {
        borderColor: alpha(theme.palette.primary.contrastText, 0.55),
      },
      '&.Mui-focused': {
        bgcolor: alpha(theme.palette.primary.contrastText, 0.22),
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.contrastText,
        borderWidth: 1,
      },
    },
    '& .MuiInputBase-input': {
      color: theme.palette.primary.contrastText,
    },
    '& .MuiInputBase-input::placeholder': {
      color: alpha(theme.palette.primary.contrastText, 0.72),
      opacity: 1,
    },
    '& .MuiSvgIcon-root': {
      color: alpha(theme.palette.primary.contrastText, 0.92),
    },
  };

  const ac = (
    <Autocomplete
      open={isXs ? mobileOpen : open}
      onOpen={() => {
        if (isXs) setMobileOpen(true);
        else setOpen(true);
        load();
      }}
      onClose={() => {
        setOpen(false);
        setMobileOpen(false);
      }}
      loading={loading}
      options={options}
      groupBy={groupBy}
      getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
      filterOptions={(x) => x}
      inputValue={input}
      onInputChange={(_, v) => setInput(v)}
      onChange={onPick}
      sx={isXs ? { width: '100%' } : appBarSearchSx}
      size="small"
      noOptionsText={loading ? <CircularProgress size={20} /> : t('globalSearch.noResults')}
      renderOption={(props, option) => (
        <li {...props} key={`${option.kind}-${option.id}`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            {option.kind === 'student' ? (
              <SchoolOutlined fontSize="small" color="primary" />
            ) : (
              <FamilyRestroomOutlined fontSize="small" color="secondary" />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {option.label}
              </Typography>
              {option.sub ? (
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {option.sub}
                </Typography>
              ) : null}
            </Box>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus={isXs && mobileOpen}
          placeholder={t('globalSearch.placeholder')}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  fontSize="small"
                  sx={{ color: alpha(theme.palette.primary.contrastText, 0.92) }}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );

  if (isXs) {
    return (
      <>
        <IconButton
          color="inherit"
          aria-label={t('globalSearch.placeholder')}
          onClick={() => {
            setMobileOpen(true);
            load();
          }}
          size="medium"
        >
          <SearchIcon />
        </IconButton>
        <Dialog fullWidth maxWidth="sm" open={mobileOpen} onClose={() => setMobileOpen(false)}>
          <DialogContent sx={{ pt: 2 }}>{ac}</DialogContent>
        </Dialog>
      </>
    );
  }

  return ac;
}
