import React, { useCallback, useMemo } from 'react';
import { Button, Divider, FormControlLabel, Grid, Stack, Switch, Typography } from '@mui/material';
import { useStudentStore } from '../../flux/useStores';
import { setModalTitle } from '../../helpers';
import InputField from '../InputField';
import ModalLogic from './modal.logic';
import { studentForm } from '../../constants';
import FamilyMembers from '../FamilyMembers';
import StudentModalParents from '../StudentModalParents';
import AppDrawer from '../AppDrawer';
import StudentClassGroupField from '../StudentClassGroupField';
import StudentTagsField from '../StudentTagsField';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../providers/LanguageProvider';
import { openStudentPrintProfile } from '../../utils/printStudentProfile';

export default function AppModal() {
  const { t } = useLanguage();
  const {
    modalType,
    student,
    handleOnSubmitStudent,
    handleCloseButton,
    handleDateOfBirthChange,
    handleOnChangeStudent,
    handleClassGroupChange,
    handleTagIdsChange,
    handleActiveChange,
  } = ModalLogic();

  const { canCreate, canEdit, isAdmin, isStaff, isStudent } = useAuth();
  const { studentModal, nationalities } = useStudentStore();
  const open = studentModal.status;

  const visibleFormFields = useMemo(() => {
    return studentForm.filter((item) => !(item.name === 'notes' && isStudent));
  }, [isStudent]);

  const handlePrintProfile = useCallback(() => {
    openStudentPrintProfile({
      data: student?.data,
      parents: student?.Parents ?? [],
      familyMembers: student?.FamilyMembers ?? [],
      labels: {
        docTitle: t('printProfile.docTitle'),
        sectionStudent: t('printProfile.sectionStudent'),
        sectionParents: t('printProfile.sectionParents'),
        sectionHousehold: t('printProfile.sectionHousehold'),
        fullName: t('printProfile.fullName'),
        dob: t('printProfile.dob'),
        nationality: t('printProfile.nationality'),
        address: t('printProfile.address'),
        eid: t('printProfile.eid'),
        email: t('printProfile.email'),
        notes: t('printProfile.internalNote'),
        colParentName: t('printProfile.colParentName'),
        colRelationship: t('printProfile.colRelationship'),
        colEmail: t('printProfile.colEmail'),
        colPhone: t('printProfile.colPhone'),
        colMemberName: t('printProfile.colMemberName'),
        colRelation: t('printProfile.colRelation'),
        colDob: t('printProfile.colDob'),
        colNationality: t('printProfile.colNationality'),
        noneParents: t('printProfile.noneParents'),
        noneHousehold: t('printProfile.noneHousehold'),
        footer: t('printProfile.footer'),
      },
    });
  }, [student, t]);

  const footer = (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end" width="100%">
      {modalType === 'view' && (
        <Button variant="outlined" onClick={handlePrintProfile}>
          {t('printProfile.printButton')}
        </Button>
      )}
      <Button color="inherit" variant="outlined" onClick={handleCloseButton}>
        {t('drawer.close')}
      </Button>
      {studentModal.type !== 'view' &&
        ((modalType === 'add' && canCreate) || (modalType === 'edit' && canEdit)) && (
          <Button variant="contained" onClick={handleOnSubmitStudent}>
            {t('drawer.saveChanges')}
          </Button>
        )}
    </Stack>
  );

  return (
    <AppDrawer
      open={open}
      onClose={handleCloseButton}
      title={setModalTitle(modalType)}
      subtitle={
        modalType === 'view'
          ? t('drawer.studentViewHint')
          : modalType === 'add'
            ? t('drawer.studentAddHint')
            : t('drawer.studentEditHint')
      }
      size="xl"
      footer={footer}
    >
      <Grid container spacing={2.25} className="main-modal">
        {visibleFormFields.map((item, index) => (
          <Grid item xs={12} sm={item.fullWidth ? 12 : 6} key={item.name || index}>
            <InputField
              form={{
                ...item,
                label:
                  item.name === 'notes' ? t('studentsPage.internalNote') : item.label,
              }}
              onChange={handleOnChangeStudent}
              value={student?.data[item.name] ?? null}
              readOnly={modalType === 'view' || item.readOnly}
              options={nationalities}
              handleDateChange={handleDateOfBirthChange}
              selectedDate={student?.data['dateOfBirth'] ?? null}
            />
          </Grid>
        ))}
        {isStaff && (
          <Grid item xs={12}>
            <StudentTagsField
              value={student?.data?.tagIds || []}
              onChange={handleTagIdsChange}
              readOnly={
                modalType === 'view' ||
                (modalType === 'add' && !canCreate) ||
                (modalType === 'edit' && !canEdit)
              }
            />
          </Grid>
        )}
        {isAdmin &&
          modalType !== 'view' &&
          ((modalType === 'add' && canCreate) || (modalType === 'edit' && canEdit)) && (
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={student?.data?.active !== false}
                  onChange={handleActiveChange}
                  color="primary"
                />
              }
              label={t('studentsPage.fieldActive')}
            />
          </Grid>
        )}
        {isStaff && modalType === 'view' && student?.data?.updatedAt && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              {t('studentsPage.lastUpdated')}: {String(student.data.updatedAt)}
            </Typography>
          </Grid>
        )}
        <Grid item xs={12}>
          <StudentClassGroupField
            value={student?.data?.classGroupId}
            onChange={handleClassGroupChange}
            readOnly={
              modalType === 'view' ||
              (modalType === 'add' && !canCreate) ||
              (modalType === 'edit' && !canEdit)
            }
          />
        </Grid>
      </Grid>

      {modalType !== 'add' && (
        <>
          <Divider sx={{ my: 3 }} />
          <StudentModalParents
            parents={student?.Parents}
            studentId={student?.data?.id ?? student?.data?.ID}
            modalType={modalType}
          />
          <FamilyMembers
            familyMembers={student?.FamilyMembers}
            options={nationalities}
            type={modalType}
            sectionTitle="Siblings and other household"
          />
        </>
      )}
    </AppDrawer>
  );
}
