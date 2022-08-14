import { useEffect, useState } from 'react'
import { addFamilyMember, deleteFamilyMember } from '../../api/api'
import studentStore from '../../flux/StudentStore'
import userStore from '../../flux/UserStore'
import { dispatchData } from '../../helpers'
import ShowToast from '../ShowToast'

const FamilyMembersLogic = () => {

    const [showModal, setShowModal] = useState(false)
    const [familyMember, setFamilyMember] = useState({})
    const [student, setStudent] = useState(studentStore._student)
    const [newFamilyMember, setNewFamilyMember] = useState(studentStore.newFamilyMember)
    const [permission, setPermission] = useState(userStore.permission)

    const handleShowModal = () => setShowModal(!showModal);

    const handlelInputChange = (e) => {
        setFamilyMember({ ...newFamilyMember, [e.targetname]: e.target.value })

        if (e.targetname === 'nationality') {
            const nationality = studentStore.nationalities.find(obj => obj.ID === Number(e.target.value));
            dispatchData('UPDATE_NEW_FAMILY_MEMBER', { ...newFamilyMember, [e.target.name]: nationality })
        } else {
            dispatchData('UPDATE_NEW_FAMILY_MEMBER', { ...newFamilyMember, [e.target.name]: e.target.value })
        }
    }

    const handleDateChange = (date) => {
        setNewFamilyMember(({ ...newFamilyMember, dateOfBirth: date }))
    }

    const handleAddFamilyMember = async (id,member) => {
        // validate form
        const { firstName, relationship, lastName, dateOfBirth } = newFamilyMember;
        if (!firstName || !relationship || !lastName || !dateOfBirth) {
            ShowToast('error', 'Please fill in all fields')
            return;
        }
        addFamilyMember(id,member)
        setShowModal(false)

    }

    // Delete the family member from the server
    const handleDeleteFamilyMember = async (id) => {
        await deleteFamilyMember(id).then(() => {
            ShowToast('success', 'Family member deleted successfully')
            dispatchData('UPDATE_STUDENT', {
                ...studentStore._student,
                FamilyMembers: [studentStore._student.FamilyMembers.filter(item => item.ID !== id)]
            })
        }).catch(err => {
            ShowToast('error', err.message)
        })
    }

    useEffect(() => {
        userStore.on('change', () => {
            setPermission(userStore.permission)
        })
        studentStore.on('change', () => {
            setNewFamilyMember(studentStore.newFamilyMember)
            setStudent(studentStore._student)
        })
    }, [])


    return {
        showModal,
        familyMember,
        student,
        newFamilyMember,
        permission,
        handleShowModal,
        handlelInputChange,
        handleDateChange,
        handleAddFamilyMember,
        handleDeleteFamilyMember
    }
}

export default FamilyMembersLogic