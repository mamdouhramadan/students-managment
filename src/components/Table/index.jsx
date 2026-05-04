import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Button,
  Link,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import CakeOutlined from '@mui/icons-material/CakeOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import Diversity3Outlined from '@mui/icons-material/Diversity3Outlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import ViewModuleOutlined from '@mui/icons-material/ViewModuleOutlined';
import TableRowsOutlined from '@mui/icons-material/TableRowsOutlined';
import ClassOutlined from '@mui/icons-material/ClassOutlined';
import moment from 'moment';
import { ActionButton } from '../ActionButton';
import { getStudentsDetails } from '../../api/getStudentAPI';
import getAllStudents from '../../api/getAllStudents';
import { getAllFamilyMembers, getStudentTags, getTimetableConfig } from '../../api/api';
import { studentActions } from '../../helpers';
import getAllNationalities from '../../api/getAllNationalities';
import { useStudentStore } from '../../flux/useStores';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../providers/LanguageProvider';
import { downloadStudentsCsv } from '../../utils/csvExport';

const PAGE_SIZE = 20;
const STUDENTS_VIEW_STORAGE_KEY = 'studentsListViewMode';

function readStoredViewMode() {
  try {
    const v = localStorage.getItem(STUDENTS_VIEW_STORAGE_KEY);
    if (v === 'table' || v === 'cards') return v;
  } catch {
    /* ignore */
  }
  return 'cards';
}

function fullName(row) {
  return `${row.firstName || ''} ${row.lastName || ''}`.trim() || '—';
}

function studentInitials(row) {
  const f = (row.firstName || '').trim();
  const l = (row.lastName || '').trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  if (l) return l.slice(0, 2).toUpperCase();
  return '?';
}

/** Integer age from ISO date string; null if invalid */
function ageFromDateOfBirth(dob) {
  if (!dob) return null;
  const m = moment(dob);
  if (!m.isValid()) return null;
  return Math.max(0, moment().diff(m, 'years'));
}

function displayOrDash(value, t) {
  const s = value != null && String(value).trim();
  return s ? String(value).trim() : t('studentsPage.detailMissing');
}

function labelForClass(classGroup, grades) {
  const grade = (grades || []).find((g) => Number(g.id) === Number(classGroup.gradeId));
  return grade?.name ? `${grade.name} — ${classGroup.name}` : classGroup.name;
}

function formatStudentClassLabel(student, grades, classGroups) {
  const cid = student.classGroupId;
  if (cid == null || cid === '') return null;
  const cg = classGroups.find((c) => Number(c.id) === Number(cid));
  if (!cg) return null;
  return labelForClass(cg, grades);
}

function isSiblingRelationship(rel) {
  if (!rel || typeof rel !== 'string') return false;
  const r = rel.trim().toLowerCase();
  return r === 'sibling' || r === 'brother' || r === 'sister' || r.includes('sibling');
}

/** Map studentId -> { family: number, siblings: number } from flat familyMembers list */
function buildFamilyCountIndex(members) {
  const map = new Map();
  for (const m of members || []) {
    const sid = m.studentId;
    if (sid == null) continue;
    if (!map.has(sid)) map.set(sid, { family: 0, siblings: 0 });
    const e = map.get(sid);
    e.family += 1;
    if (isSiblingRelationship(m.relationship)) e.siblings += 1;
  }
  return map;
}

function DetailRow({ icon, label, children, multilineClamp }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
      <Box
        sx={{
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          mt: 0.15,
          flexShrink: 0,
        }}
        aria-hidden
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          color="text.primary"
          sx={{
            mt: 0.25,
            wordBreak: 'break-word',
            ...(multilineClamp
              ? {
                  display: '-webkit-box',
                  WebkitLineClamp: multilineClamp,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }
              : {}),
          }}
        >
          {children}
        </Typography>
      </Box>
    </Box>
  );
}

const Table = () => {
  const { t } = useLanguage();
  const {
    authUser,
    canCreate,
    canEdit,
    canView,
    isAdmin,
    isStudent,
  } = useAuth();
  const { studentList } = useStudentStore();
  const [page, setPage] = useState(1);
  const [familyMembersRaw, setFamilyMembersRaw] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [viewMode, setViewMode] = useState(readStoredViewMode);
  const [grades, setGrades] = useState([]);
  const [classGroups, setClassGroups] = useState([]);
  const [configLoading, setConfigLoading] = useState(true);
  const [studentTagOptions, setStudentTagOptions] = useState([]);
  const [showInactiveStudents, setShowInactiveStudents] = useState(false);
  const [tagFilterIds, setTagFilterIds] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem(STUDENTS_VIEW_STORAGE_KEY, viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode]);

  useEffect(() => {
    let cancelled = false;
    setConfigLoading(true);
    getTimetableConfig()
      .then((response) => {
        if (cancelled) return;
        setGrades(response.data?.grades || []);
        setClassGroups(response.data?.classGroups || []);
      })
      .catch(() => {
        if (!cancelled) {
          setGrades([]);
          setClassGroups([]);
        }
      })
      .finally(() => {
        if (!cancelled) setConfigLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getStudentTags()
      .then((response) => {
        if (!cancelled) setStudentTagOptions(response.data || []);
      })
      .catch(() => {
        if (!cancelled) setStudentTagOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const familyCountByStudent = useMemo(
    () => buildFamilyCountIndex(familyMembersRaw),
    [familyMembersRaw]
  );

  const rows = useMemo(() => {
    if (isStudent && authUser?.studentId != null) {
      return studentList.filter((s) => (s.id ?? s.ID) === authUser.studentId);
    }
    return studentList;
  }, [studentList, authUser, isStudent]);

  const sectionOptions = useMemo(() => {
    if (!gradeFilter) return classGroups;
    const gid = Number(gradeFilter);
    return classGroups.filter((cg) => Number(cg.gradeId) === gid);
  }, [classGroups, gradeFilter]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((s) => {
      if (!isStudent && !showInactiveStudents && s.active === false) {
        return false;
      }

      if (tagFilterIds.length > 0) {
        const assigned = (s.tagIds || []).map((x) => Number(x));
        const matchesTag = tagFilterIds.some((tagId) => assigned.includes(Number(tagId)));
        if (!matchesTag) return false;
      }

      if (q) {
        const blob = [
          s.firstName,
          s.lastName,
          s.email,
          s.eid,
          s.address,
          s.notes,
        ]
          .map((x) => String(x ?? '').toLowerCase())
          .join(' ');
        const full = `${s.firstName || ''} ${s.lastName || ''}`.trim().toLowerCase();
        if (!blob.includes(q) && !full.includes(q)) return false;
      }

      const cid = s.classGroupId != null && s.classGroupId !== '' ? Number(s.classGroupId) : null;
      if (sectionFilter) {
        if (cid !== Number(sectionFilter)) return false;
      } else if (gradeFilter) {
        const gid = Number(gradeFilter);
        const cg = cid != null ? classGroups.find((c) => Number(c.id) === cid) : null;
        if (!cg || Number(cg.gradeId) !== gid) return false;
      }
      return true;
    });
  }, [
    rows,
    searchQuery,
    gradeFilter,
    sectionFilter,
    classGroups,
    isStudent,
    showInactiveStudents,
    tagFilterIds,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount));
  }, [pageCount]);

  useEffect(() => {
    getAllStudents();
    getAllNationalities();
  }, []);

  useEffect(() => {
    getAllFamilyMembers()
      .then((res) => setFamilyMembersRaw(res.data || []))
      .catch(() => setFamilyMembersRaw([]));
  }, []);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const handleAddButton = () => {
    studentActions.openStudentModal({ type: 'add', status: true });
  };

  const rangeFrom = filteredRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeTo = Math.min(page * PAGE_SIZE, filteredRows.length);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    gradeFilter !== '' ||
    sectionFilter !== '' ||
    tagFilterIds.length > 0 ||
    showInactiveStudents;

  const clearFilters = () => {
    setSearchQuery('');
    setGradeFilter('');
    setSectionFilter('');
    setTagFilterIds([]);
    setShowInactiveStudents(false);
    setPage(1);
  };

  const exportFilename = useMemo(() => {
    const dateValue = new Date();
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    return t('studentsPage.exportFilename', { date: `${year}-${month}-${day}` });
  }, [t]);

  const handleExportCsv = useCallback(() => {
    if (!filteredRows.length) return;
    downloadStudentsCsv(filteredRows, exportFilename);
  }, [filteredRows, exportFilename]);

  const toolbar = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
        rowGap: 1.5,
        mb: 2,
        width: 1,
      }}
    >
      <Box sx={{ flex: '1 1 auto', maxWidth: 400, minWidth: 0 }}>
        <TextField
          size="small"
          fullWidth
          placeholder={t('studentsPage.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Stack
        direction="row"
        spacing={1.5}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
        justifyContent="flex-end"
        sx={{
          flexShrink: 0,
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        <FormControl size="small" sx={{ minWidth: 160, maxWidth: 220 }} disabled={configLoading}>
          <InputLabel id="students-filter-grade">{t('studentsPage.filterByGrade')}</InputLabel>
          <Select
            labelId="students-filter-grade"
            label={t('studentsPage.filterByGrade')}
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setSectionFilter('');
              setPage(1);
            }}
          >
            <MenuItem value="">
              <em>{t('studentsPage.allGrades')}</em>
            </MenuItem>
            {grades.map((g) => (
              <MenuItem key={g.id} value={String(g.id)}>
                {g.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180, maxWidth: 280 }} disabled={configLoading}>
          <InputLabel id="students-filter-section">{t('studentsPage.filterBySection')}</InputLabel>
          <Select
            labelId="students-filter-section"
            label={t('studentsPage.filterBySection')}
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">
              <em>{t('studentsPage.allSections')}</em>
            </MenuItem>
            {sectionOptions.map((cg) => (
              <MenuItem key={cg.id} value={String(cg.id)}>
                {labelForClass(cg, grades)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          size="small"
          onChange={(_, v) => {
            if (v) setViewMode(v);
          }}
        >
          <ToggleButton value="cards" aria-label={t('studentsPage.viewCards')}>
            <ViewModuleOutlined fontSize="small" />
          </ToggleButton>
          <ToggleButton value="table" aria-label={t('studentsPage.viewTable')}>
            <TableRowsOutlined fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
        {!isStudent && studentTagOptions.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 200, maxWidth: 320 }}>
            <InputLabel id="students-filter-tags">{t('studentsPage.filterByTag')}</InputLabel>
            <Select
              labelId="students-filter-tags"
              label={t('studentsPage.filterByTag')}
              multiple
              value={tagFilterIds}
              onChange={(event) => {
                const value = event.target.value;
                setTagFilterIds(typeof value === 'string' ? value.split(',').map(Number) : value);
                setPage(1);
              }}
              renderValue={(selected) =>
                (selected || [])
                  .map((tagId) => studentTagOptions.find((tagRow) => tagRow.id === tagId)?.name || tagId)
                  .join(', ')
              }
            >
              {studentTagOptions.map((tagRow) => (
                <MenuItem key={tagRow.id} value={tagRow.id}>
                  {tagRow.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {!isStudent && (
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={showInactiveStudents}
                onChange={(event) => {
                  setShowInactiveStudents(event.target.checked);
                  setPage(1);
                }}
              />
            }
            label={t('studentsPage.showInactive')}
          />
        )}
        <Button
          variant="outlined"
          size="small"
          onClick={handleExportCsv}
          disabled={!filteredRows.length}
        >
          {t('studentsPage.exportCsv')}
        </Button>
      </Stack>
    </Box>
  );

  const paginationBlock = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        mt: 3,
        width: 1,
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {t('studentsPage.paginationSummary', {
          from: rangeFrom,
          to: rangeTo,
          total: filteredRows.length,
        })}
      </Typography>
      <Pagination
        count={pageCount}
        page={page}
        onChange={(_, value) => setPage(value)}
        color="primary"
        showFirstButton
        showLastButton
        size="medium"
      />
    </Box>
  );

  const emptyState = (
    <Box sx={{ p: 4, textAlign: 'center', maxWidth: 520, mx: 'auto' }}>
      <Typography variant="h6" sx={{ m: 0, fontWeight: 500, mb: 1 }}>
        {t('table.noStudents')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('studentsPage.emptyOnboardingHint')}
      </Typography>
      {isAdmin && (
        <Stack direction="column" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
          <Link component={RouterLink} to="/admin/grades-classes" underline="hover">
            {t('studentsPage.emptyLinkGrades')}
          </Link>
          <Link component={RouterLink} to="/admin/courses" underline="hover">
            {t('studentsPage.emptyLinkCourses')}
          </Link>
        </Stack>
      )}
      {canCreate && (
        <Button variant="contained" sx={{ mt: 1 }} onClick={handleAddButton}>
          {t('table.addNewStudent')}
        </Button>
      )}
    </Box>
  );

  const noFilterMatchState = (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {t('studentsPage.noStudentsForFilter')}
      </Typography>
      <Button variant="outlined" onClick={clearFilters}>
        {t('studentsPage.clearFilters')}
      </Button>
    </Box>
  );

  if (rows.length === 0) {
    return emptyState;
  }

  if (filteredRows.length === 0 && hasActiveFilters) {
    return (
      <>
        {toolbar}
        {noFilterMatchState}
      </>
    );
  }

  return (
    <>
      {toolbar}
      {viewMode === 'cards' ? (
        <Grid container spacing={2}>
          {paginatedRows.map((row) => {
            const sid = row.id ?? row.ID;
            const name = fullName(row);
            const img = row.avatarUrl || row.photoUrl || row.imageUrl;
            const age = ageFromDateOfBirth(row.dateOfBirth);
            const ageText =
              age != null ? t('studentsPage.ageYears', { age }) : t('studentsPage.detailMissing');
            const counts = familyCountByStudent.get(sid) || { family: 0, siblings: 0 };
            const familyCountText = t('studentsPage.countValue', { count: counts.family });
            const siblingsCountText = t('studentsPage.countValue', { count: counts.siblings });
            const classLabel = formatStudentClassLabel(row, grades, classGroups);

            return (
              <Grid item xs={12} md={6} lg={4} xl={3} key={sid}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    borderColor: 'divider',
                    transition: (theme) =>
                      theme.transitions.create(['box-shadow', 'border-color'], {
                        duration: theme.transitions.duration.short,
                      }),
                    '&:hover': {
                      boxShadow: (theme) => (theme.palette.mode === 'dark' ? 4 : 3),
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pt: 2.5, px: 2, pb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Avatar
                        src={img || undefined}
                        alt={name}
                        sx={{
                          width: 64,
                          height: 64,
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          boxShadow: 1,
                        }}
                      >
                        {studentInitials(row)}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 1,
                          }}
                        >
                          {canView ? (
                            <Typography
                              component="button"
                              type="button"
                              variant="subtitle1"
                              fontWeight={800}
                              noWrap
                              title={name}
                              onClick={() => getStudentsDetails(sid, 'view')}
                              sx={{
                                p: 0,
                                m: 0,
                                border: 0,
                                bgcolor: 'transparent',
                                color: 'text.primary',
                                cursor: 'pointer',
                                textAlign: 'left',
                                maxWidth: '100%',
                                '&:hover': {
                                  color: 'primary.main',
                                },
                              }}
                            >
                              {name}
                            </Typography>
                          ) : (
                            <Typography variant="subtitle1" fontWeight={800} noWrap title={name}>
                              {name}
                            </Typography>
                          )}
                          {canEdit ? (
                            <ActionButton
                              label={t('table.edit')}
                              icon="edit"
                              onClick={() => getStudentsDetails(sid, 'edit')}
                            />
                          ) : null}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 0.5 }}>
                          <EmailOutlined
                            sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0, mt: 0.1 }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            sx={{ wordBreak: 'break-word' }}
                            title={row.email || undefined}
                          >
                            {displayOrDash(row.email, t)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={1.75}>
                      <Grid item xs={6}>
                        <DetailRow
                          icon={<ClassOutlined sx={{ fontSize: 20 }} />}
                          label={t('studentsPage.classGroup')}
                        >
                          {classLabel || t('studentsPage.classGroupNone')}
                        </DetailRow>
                      </Grid>
                      <Grid item xs={6}>
                        <DetailRow
                          icon={<BadgeOutlined sx={{ fontSize: 20 }} />}
                          label={t('studentsPage.eid')}
                        >
                          {displayOrDash(row.eid, t)}
                        </DetailRow>
                      </Grid>
                      <Grid item xs={4}>
                        <DetailRow icon={<CakeOutlined sx={{ fontSize: 20 }} />} label={t('studentsPage.ageLabel')}>
                          {ageText}
                        </DetailRow>
                      </Grid>
                      <Grid item xs={4}>
                        <DetailRow
                          icon={<GroupsOutlined sx={{ fontSize: 20 }} />}
                          label={t('studentsPage.familyMembersCountLabel')}
                        >
                          {familyCountText}
                        </DetailRow>
                      </Grid>
                      <Grid item xs={4}>
                        <DetailRow
                          icon={<Diversity3Outlined sx={{ fontSize: 20 }} />}
                          label={t('studentsPage.siblingsCountLabel')}
                        >
                          {siblingsCountText}
                        </DetailRow>
                      </Grid>
                      <Grid item xs={12}>
                        <DetailRow
                          icon={<LocationOnOutlined sx={{ fontSize: 20 }} />}
                          label={t('studentsPage.address')}
                          multilineClamp={2}
                        >
                          {displayOrDash(row.address, t)}
                        </DetailRow>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <MuiTable size="small" aria-label={t('studentsPage.viewTable')}>
            <TableHead>
              <TableRow>
                <TableCell>{t('studentsPage.colName')}</TableCell>
                <TableCell>{t('studentsPage.colEmail')}</TableCell>
                <TableCell>{t('studentsPage.colClassGroup')}</TableCell>
                <TableCell align="right">{t('studentsPage.ageLabel')}</TableCell>
                <TableCell align="right">{t('studentsPage.familyMembersCountLabel')}</TableCell>
                <TableCell align="right">{t('studentsPage.siblingsCountLabel')}</TableCell>
                <TableCell align="right">{t('studentsPage.colActions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row) => {
                const sid = row.id ?? row.ID;
                const name = fullName(row);
                const img = row.avatarUrl || row.photoUrl || row.imageUrl;
                const age = ageFromDateOfBirth(row.dateOfBirth);
                const ageText =
                  age != null ? t('studentsPage.ageYears', { age }) : t('studentsPage.detailMissing');
                const counts = familyCountByStudent.get(sid) || { family: 0, siblings: 0 };
                const classLabel = formatStudentClassLabel(row, grades, classGroups);

                return (
                  <TableRow key={sid} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={img || undefined}
                          alt={name}
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                          }}
                        >
                          {studentInitials(row)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600} noWrap title={name}>
                          {name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap title={row.email || ''}>
                        {displayOrDash(row.email, t)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap title={classLabel || ''}>
                        {classLabel || t('studentsPage.classGroupNone')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{ageText}</TableCell>
                    <TableCell align="right">{counts.family}</TableCell>
                    <TableCell align="right">{counts.siblings}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap">
                        {canView && (
                          <ActionButton
                            label={t('table.view')}
                            icon="visibility"
                            onClick={() => getStudentsDetails(sid, 'view')}
                          />
                        )}
                        {canEdit && (
                          <ActionButton
                            label={t('table.edit')}
                            icon="edit"
                            onClick={() => getStudentsDetails(sid, 'edit')}
                          />
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </MuiTable>
        </TableContainer>
      )}
      {paginationBlock}
    </>
  );
};

export default Table;
