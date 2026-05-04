import ShowToast from '../components/ShowToast'
import studentStore from '../flux/StudentStore'
import { studentActions } from '../helpers'
import { addFamilyMember as postFamilyMember } from './api'
import { extractNationalityId, normalizeFamilyMember } from './normalize'

const addFamilyMember = (studentId, newMember) => {
    const payload = {
        studentId,
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        relationship: newMember.relationship,
        dateOfBirth: newMember.dateOfBirth,
        nationalityId: extractNationalityId(newMember.nationality),
    };

    postFamilyMember(payload).then(resp => {
        ShowToast('success', 'Family member added successfully')
        const added = normalizeFamilyMember(resp.data, studentStore.nationalities);
        studentActions.updateStudent({
            ...studentStore._student,
            FamilyMembers: studentStore._student
                ? [...studentStore._student.FamilyMembers, added]
                : [added]
        })
        studentActions.updateNewFamilyMember({});
    }).catch(err => {
        ShowToast('error', err?.response?.data?.message || 'Error adding family member')
        console.log(err);
    })
}

export default addFamilyMember
