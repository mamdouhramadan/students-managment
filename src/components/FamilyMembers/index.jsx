import moment from 'moment'
import React, { useState } from 'react'
import { FamilyForm } from '../../constants'
import studentStore from '../../flux/StudentStore'
import InputField from '../InputField';
import AppDrawer from '../AppDrawer';
import './FamilyMembers.css'
import updateMemberNationality from '../../api/updateMemberNationality'
import { deleteFamilyMember } from '../../api/api'
import addFamilyMember from '../../api/addFamilyMember'
import ShowToast from '../ShowToast'
import { studentActions } from '../../helpers'
import { useStudentStore } from '../../flux/useStores'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../providers/LanguageProvider'
import {
    Box,
    Button,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import Add from '@mui/icons-material/Add'

const FamilyMembers = ({
    type,
    familyMembers = [],
    options,
    sectionTitle = 'Family members',
}) => {
    const { t } = useLanguage()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const { student, newFamilyMember, studentModal } = useStudentStore()
    const { canEdit } = useAuth()

    const handleInputChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        const prev = studentStore.newFamilyMember;
        if (name === 'nationality') {
            const nationality = studentStore.nationalities.find(obj => (obj.id ?? obj.ID) === Number(value));
            studentActions.updateNewFamilyMember({ ...prev, nationality });
        } else {
            studentActions.updateNewFamilyMember({ ...prev, [name]: value });
        }
    }

    const handleDateChange = (date) => {
        studentActions.updateNewFamilyMember({
            ...studentStore.newFamilyMember,
            dateOfBirth: date,
        });
    }

    const handleAddFamilyMember = () => {
        const m = studentStore.newFamilyMember;
        const { firstName, relationship, lastName, dateOfBirth } = m;
        if (!firstName || !relationship || !lastName || !dateOfBirth) {
            ShowToast('error', 'Please fill in all fields')
            return;
        }
        addFamilyMember(student.data.id ?? student.data.ID, m)
        setDrawerOpen(false)
    }

    const handleDeleteFamilyMember = async (id) => {
        deleteFamilyMember(id).then(() => {
            ShowToast('success', 'Family member deleted successfully')
            studentActions.updateStudent({
                ...studentStore._student,
                FamilyMembers: studentStore._student.FamilyMembers.filter(item => (item.id ?? item.ID) !== id)
            })
        }).catch(err => {
            ShowToast('error', err?.response?.data?.message || err.message)
        }).finally(() => {
            setDrawerOpen(false)
        })
    }

    return (
        <Box className="FamilyMembers" sx={{ mt: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">{sectionTitle}</Typography>
                {
                    type === 'edit' && canEdit &&
                    <Button startIcon={<Add />} onClick={() => setDrawerOpen(true)} className="add-btn" variant="contained">
                        {t('drawer.addHouseholdMember')}
                    </Button>
                }
            </Box>

            <AppDrawer
                nested
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={t('drawer.addHouseholdMember')}
                subtitle={t('drawer.householdFormHint')}
                size="md"
                showHandle
                footer={
                    <>
                        <Button color="inherit" variant="outlined" onClick={() => setDrawerOpen(false)}>
                            {t('drawer.cancel')}
                        </Button>
                        <Button variant="contained" onClick={handleAddFamilyMember}>
                            {t('drawer.save')}
                        </Button>
                    </>
                }
            >
                {studentModal.type === 'edit' && (
                    <Grid container spacing={2}>
                        {
                            FamilyForm.map((item, index) =>
                                <Grid item xs={12} sm={6} key={index}>
                                    <InputField
                                        key={index}
                                        form={item}
                                        onChange={(e) => handleInputChange(e)}
                                        value={newFamilyMember[item.name] || null}
                                        options={item.options || options}
                                        handleDateChange={handleDateChange}
                                        selectedDate={newFamilyMember['dateOfBirth'] || null}
                                    />
                                </Grid>
                            )
                        }
                    </Grid>
                )}
            </AppDrawer>

            {
                familyMembers.length > 0 ?
                    <Table size="small" sx={{ backgroundColor: 'background.paper' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Nationality</TableCell>
                                <TableCell>Date Of Birth</TableCell>
                                <TableCell>Relationship</TableCell>
                                {
                                    type !== 'view' && canEdit &&
                                    <TableCell align="center">Action</TableCell>
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {familyMembers?.map((item, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{`${item?.firstName} ${item?.lastName}`}</TableCell>
                                        <TableCell>
                                            {type === 'view'
                                                ? (item?.nationality?.Title || '-')
                                                : (canEdit ? (
                                                    <select
                                                        onChange={(e) => updateMemberNationality(e, item.id ?? item.ID)}
                                                        value={item?.nationality?.ID || item?.nationality?.id || 0}
                                                        style={{ minWidth: 140 }}
                                                    >
                                                        <option value={0} disabled>Choose Nationality</option>
                                                        {
                                                            studentStore.nationalities.map((option, idx) => (
                                                                <option key={idx} value={option.id ?? option.ID}>{option.Title}</option>
                                                            ))
                                                        }
                                                    </select>
                                                ) : (item?.nationality?.Title || '-'))
                                            }
                                        </TableCell>
                                        <TableCell>{`${moment(item.dateOfBirth).format('L')}`}</TableCell>
                                        <TableCell>{`${item.relationship}`}</TableCell>
                                        {
                                            type !== 'view' && canEdit &&
                                            <TableCell align="center">
                                                <IconButton
                                                    aria-label="delete"
                                                    onClick={() => handleDeleteFamilyMember(item.id ?? item.ID)}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <DeleteOutline />
                                                </IconButton>
                                            </TableCell>
                                        }
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    :
                    <Paper className='p-3 text-center'>
                        <Typography variant="subtitle2">No members found</Typography>
                    </Paper>
            }
        </Box>
    )
}

export default FamilyMembers
