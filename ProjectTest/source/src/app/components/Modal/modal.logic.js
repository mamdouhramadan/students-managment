import { useEffect, useState } from 'react'
import { addNewStudentApi } from '../../api/addNewStudentApi';
import { editStudentApi } from '../../api/editStudentApi';
import { initialStudentStore } from '../../constants';
import studentStore from '../../flux/StudentStore';
import userStore from '../../flux/UserStore';
import { dispatchData } from '../../helpers';
import ShowToast from '../ShowToast';

const ModalLogic = () => {


    const { studentModal, _student } = studentStore;
    const [permission, setPermission] = useState(userStore.permission);


    const [showModal, setShowModal] = useState(studentModal.status);
    const [modalType, setModalType] = useState(studentModal.type);
    const [student, setStudent] = useState(_student);

    const handleCloseButton = () => {
        dispatchData('OPEN_STUDENT_MODAL', { type: 'view', status: false })
        dispatchData('UPDATE_STUDENT',initialStudentStore)
    }

    // Handle the birth date change for student
    const handleDateOfBirthChange = (date) => {
        setStudent(student => ({
            ...student,
            data: { ...student.data, dateOfBirth: date }
        }))
    }

    const handleOnChangeStudent = (e) => {
        dispatchData('UPDATE_STUDENT', (student) => ({
            ...student, data: { ...student.data, [e.target.name]: e.target.value }
        })
        )
    }

    useEffect(() => {
        studentStore.on('change', () => {
            setShowModal(studentStore.studentModal.status);
            setModalType(studentStore.studentModal.type);
            setStudent(studentStore._student);
            setPermission(userStore.permission);
        })
    }, [])

    const handleOnSubmitStudent = async () => {

        // Check if the input is valid
        if (student.data.firstName === '' || student.data.lastName === '' || student.data.dateOfBirth === '') {
            ShowToast('error', 'Please fill all fields')
            return;
        }

        // check if the student is to be added or edited
        // 1- if the student is to be added, then add the student to the server
        if (modalType === 'add') {
            addNewStudentApi(student.data)

        } else if (modalType === 'edit') { // if student is to be edited, then edit the student details in the server
            editStudentApi(student.data.ID, student.data)
        }
    }
    return {
        permission,
        studentModal,
        setShowModal,
        showModal,
        modalType,
        student,
        handleOnSubmitStudent,
        handleCloseButton,
        handleDateOfBirthChange,
        handleOnChangeStudent
    }
}

export default ModalLogic;