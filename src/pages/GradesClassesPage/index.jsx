/**
 * Admin UI for grades and class sections: one card per grade; sections are nested and added per grade.
 * Data from GET /api/timetable/config; mutations use /api/timetable/grades and /api/timetable/class-groups.
 */
import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PageHeader from '../../components/PageHeader';
import { useGradesClasses } from '../../hooks/gradesClasses';
import { useLanguage } from '../../providers/LanguageProvider';

const GradesClassesPage = () => {
  const { t } = useLanguage();
  const theme = useTheme();
  const {
    addSectionForGrade,
    config,
    deleteClassGroup,
    deleteGrade,
    editCgGradeId,
    editCgId,
    editCgName,
    editGradeId,
    editGradeName,
    grades,
    handleAddGrade,
    loading,
    newGradeName,
    newSectionNames,
    sectionsGroupedByGradeId,
    setEditCgGradeId,
    setEditCgId,
    setEditCgName,
    setEditGradeId,
    setEditGradeName,
    setNewGradeName,
    setNewSectionNames,
    saveEditedClassGroup,
    saveEditedGrade,
  } = useGradesClasses();

  if (loading) {
    return (
      <Box>
        <PageHeader title={t('gradesClassesPage.title')} subtitle={t('gradesClassesPage.subtitle')} />
        <Typography color="text.secondary">{t('gradesClassesPage.loading')}</Typography>
      </Box>
    );
  }

  if (!config) {
    return (
      <Box>
        <PageHeader title={t('gradesClassesPage.title')} subtitle={t('gradesClassesPage.subtitle')} />
        <Typography color="error">{t('gradesClassesPage.loadError')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <PageHeader title={t('gradesClassesPage.title')} subtitle={t('gradesClassesPage.subtitle')} />

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          bgcolor: (th) => alpha(th.palette.primary.main, 0.04),
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          {t('gradesClassesPage.addGradeTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 640 }}>
          {t('gradesClassesPage.addGradeHint')}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <TextField
            size="small"
            label={t('timetablePage.newGradeName')}
            value={newGradeName}
            onChange={(e) => setNewGradeName(e.target.value)}
            sx={{ minWidth: { sm: 260 }, flex: { sm: '1 1 260px' } }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddGrade}
            sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
          >
            {t('timetablePage.addGrade')}
          </Button>
        </Stack>
      </Paper>

      {!grades.length ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">{t('gradesClassesPage.noGrades')}</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {grades.map((g) => {
            const sections = sectionsGroupedByGradeId.get(g.id) || [];
            const count = sections.length;
            return (
              <Grid item xs={12} sm={6} lg={4} key={g.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.06)}`,
                  }}
                >
                  <CardHeader
                    sx={{
                      pb: 1,
                      background: (th) =>
                        `linear-gradient(135deg, ${alpha(th.palette.primary.main, 0.1)} 0%, ${alpha(th.palette.primary.main, 0.02)} 100%)`,
                    }}
                    title={
                      editGradeId === g.id ? (
                        <TextField
                          size="small"
                          fullWidth
                          autoFocus
                          value={editGradeName}
                          onChange={(e) => setEditGradeName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              saveEditedGrade(g.id);
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="h6" component="div" fontWeight={700}>
                          {g.name}
                        </Typography>
                      )
                    }
                    subheader={
                      <Typography variant="caption" color="text.secondary">
                        {t('gradesClassesPage.sectionsCount', { count })}
                      </Typography>
                    }
                    action={
                      editGradeId === g.id ? (
                        <Stack direction="row" spacing={0.5}>
                          <Button
                            size="small"
                            onClick={() => saveEditedGrade(g.id)}
                          >
                            {t('timetablePage.save')}
                          </Button>
                          <Button size="small" onClick={() => setEditGradeId(null)}>
                            {t('timetablePage.cancel')}
                          </Button>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={0}>
                          <IconButton
                            size="small"
                            aria-label="edit-grade"
                            onClick={() => {
                              setEditGradeId(g.id);
                              setEditGradeName(g.name);
                            }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="delete-grade"
                            onClick={() => deleteGrade(g.id)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      )
                    }
                  />
                  <Divider />
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 2 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.5, mb: 1 }}>
                      {t('gradesClassesPage.sectionsInGrade')}
                    </Typography>

                    {sections.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 1, mb: 1 }}>
                        {t('gradesClassesPage.noSections')}
                      </Typography>
                    ) : (
                      <Stack spacing={1} sx={{ mb: 2, flex: 1 }}>
                        {sections.map((cg) => (
                          <Paper
                            key={cg.id}
                            variant="outlined"
                            sx={{
                              px: 1.5,
                              py: 1,
                              borderRadius: 1.5,
                              bgcolor: 'background.paper',
                            }}
                          >
                            {editCgId === cg.id ? (
                              <Stack spacing={1.5}>
                                <FormControl size="small" fullWidth>
                                  <InputLabel>{t('timetablePage.grade')}</InputLabel>
                                  <Select
                                    label={t('timetablePage.grade')}
                                    value={editCgGradeId}
                                    onChange={(e) => setEditCgGradeId(e.target.value)}
                                  >
                                    {grades.map((gr) => (
                                      <MenuItem key={gr.id} value={String(gr.id)}>
                                        {gr.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                <TextField
                                  size="small"
                                  fullWidth
                                  label={t('timetablePage.sectionName')}
                                  value={editCgName}
                                  onChange={(e) => setEditCgName(e.target.value)}
                                />
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => saveEditedClassGroup(cg.id)}
                                  >
                                    {t('timetablePage.save')}
                                  </Button>
                                  <Button size="small" onClick={() => setEditCgId(null)}>
                                    {t('timetablePage.cancel')}
                                  </Button>
                                </Stack>
                              </Stack>
                            ) : (
                              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                                <Typography variant="body2" fontWeight={600}>
                                  {cg.name}
                                </Typography>
                                <Stack direction="row" spacing={0}>
                                  <IconButton
                                    size="small"
                                    aria-label="edit-section"
                                    onClick={() => {
                                      setEditCgId(cg.id);
                                      setEditCgName(cg.name);
                                      setEditCgGradeId(String(cg.gradeId));
                                    }}
                                  >
                                    <EditOutlinedIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    aria-label="delete-section"
                                    onClick={() => deleteClassGroup(cg.id)}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </Stack>
                            )}
                          </Paper>
                        ))}
                      </Stack>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      {t('timetablePage.addClassGroup')}
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'stretch' }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder={t('timetablePage.sectionName')}
                        value={newSectionNames[g.id] ?? ''}
                        onChange={(e) =>
                          setNewSectionNames((prev) => ({ ...prev, [g.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSectionForGrade(g.id);
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={<AddIcon />}
                        onClick={() => addSectionForGrade(g.id)}
                        sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        {t('timetablePage.addClassGroup')}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default GradesClassesPage;
