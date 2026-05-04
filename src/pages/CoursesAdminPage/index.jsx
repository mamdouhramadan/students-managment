import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PageHeader from '../../components/PageHeader';
import { useCourses } from '../../hooks/courses';
import { useLanguage } from '../../providers/LanguageProvider';

/**
 * Admin catalog for timetable courses (`GET/POST/PATCH/DELETE /api/courses`).
 * Lists rows from the server; create/edit/delete call the same API used by the timetable grid.
 */
const CoursesAdminPage = () => {
  const { t } = useLanguage();
  const {
    beginEditCourse,
    cancelEditCourse,
    catalogCourses,
    deleteCourseById,
    editingCourseCode,
    editingCourseId,
    editingCourseName,
    handleAddCourse,
    loading,
    newCourseCode,
    newCourseName,
    saveEditedCourse,
    setEditingCourseCode,
    setEditingCourseName,
    setNewCourseCode,
    setNewCourseName,
  } = useCourses();

  if (loading) {
    return (
      <Box>
        <PageHeader title={t('coursesPage.title')} subtitle={t('coursesPage.subtitle')} />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {t('coursesPage.loading')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 880 }}>
      <PageHeader title={t('coursesPage.title')} subtitle={t('coursesPage.subtitle')} />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2, mb: 3 }} flexWrap="wrap" useFlexGap>
        <TextField
          size="small"
          label={t('coursesPage.fieldName')}
          value={newCourseName}
          onChange={(event) => setNewCourseName(event.target.value)}
          sx={{ minWidth: 200 }}
        />
        <TextField
          size="small"
          label={t('coursesPage.fieldCode')}
          value={newCourseCode}
          onChange={(event) => setNewCourseCode(event.target.value)}
          sx={{ minWidth: 120 }}
        />
        <Button variant="contained" onClick={handleAddCourse}>
          {t('coursesPage.add')}
        </Button>
      </Stack>

      {!catalogCourses.length ? (
        <Typography color="text.secondary">{t('coursesPage.empty')}</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('coursesPage.colName')}</TableCell>
                <TableCell width={140}>{t('coursesPage.colCode')}</TableCell>
                <TableCell width={160} align="right">
                  {t('table.actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {catalogCourses.map((courseRow) => (
                <TableRow key={courseRow.id}>
                  {editingCourseId === courseRow.id ? (
                    <>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={editingCourseName}
                          onChange={(event) => setEditingCourseName(event.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={editingCourseCode}
                          onChange={(event) => setEditingCourseCode(event.target.value)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={saveEditedCourse}>
                          {t('timetablePage.save')}
                        </Button>
                        <Button size="small" onClick={cancelEditCourse}>
                          {t('timetablePage.cancel')}
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{courseRow.name}</TableCell>
                      <TableCell>{courseRow.code || '—'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          aria-label="edit"
                          onClick={() => beginEditCourse(courseRow)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="delete"
                          onClick={() => deleteCourseById(courseRow.id)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CoursesAdminPage;
