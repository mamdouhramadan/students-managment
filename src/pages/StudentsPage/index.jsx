import React from 'react';
import { Box, Button } from '@mui/material';
import Table from '../../components/Table';
import AppModal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { studentActions } from '../../helpers';
import { useAuth } from '../../hooks/useAuth';
import { useOpenStudent } from '../../hooks/students';
import { useLanguage } from '../../providers/LanguageProvider';

const StudentsPage = () => {
  const { canCreate } = useAuth();
  const { t } = useLanguage();
  useOpenStudent();

  const headerAction = canCreate ? (
    <Button
      variant="contained"
      onClick={() => studentActions.openStudentModal({ type: 'add', status: true })}
    >
      {t('studentsPage.addStudent')}
    </Button>
  ) : null;

  return (
    <Box sx={{ width: 1 }} className="mb-5">
      <PageHeader
        title={t('studentsPage.title')}
        subtitle={t('studentsPage.subtitle')}
        action={headerAction}
      />
      <Table />
      <AppModal />
    </Box>
  );
};

export default StudentsPage;
