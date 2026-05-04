import { addNewStudentApi } from '../../api/addNewStudentApi';
import { editStudentApi } from '../../api/editStudentApi';
import { initialStudentStore } from '../../constants';
import studentStore from '../../flux/StudentStore';
import { studentActions } from '../../helpers';
import ShowToast from '../ShowToast';
import { useStudentStore } from '../../flux/useStores';
import { useAuth } from '../../hooks/useAuth';

const ModalLogic = () => {
    const { student, studentModal } = useStudentStore();
    const { permission } = useAuth();
    const modalType = studentModal.type;

    const handleCloseButton = () => {
        studentActions.openStudentModal({ type: 'view', status: false })
        studentActions.updateStudent(initialStudentStore)
    }

    const handleDateOfBirthChange = (date) => {
        const current = studentStore._student;
        studentActions.updateStudent({
            ...current,
            data: { ...current.data, dateOfBirth: date },
        });
    }

    const handleOnChangeStudent = (e) => {
        const { name, value } = e.target;
        const current = studentStore._student;
        studentActions.updateStudent({
            ...current,
            data: { ...current.data, [name]: value },
        });
    }

    const handleClassGroupChange = (classGroupId) => {
        const current = studentStore._student;
        studentActions.updateStudent({
            ...current,
            data: { ...current.data, classGroupId },
        });
    }

    const handleTagIdsChange = (tagIds) => {
        const current = studentStore._student;
        studentActions.updateStudent({
            ...current,
            data: { ...current.data, tagIds },
        });
    }

    const handleActiveChange = (event) => {
        const current = studentStore._student;
        studentActions.updateStudent({
            ...current,
            data: { ...current.data, active: event.target.checked },
        });
    }

    const handleOnSubmitStudent = async () => {

        if (student.data.firstName === '' || student.data.lastName === '' || student.data.dateOfBirth === '') {
            ShowToast('error', 'Please fill all fields')
            return;
        }

        if (modalType === 'add') {
            addNewStudentApi(student.data)
        } else if (modalType === 'edit') {
            const sid = student.data.id ?? student.data.ID;
            editStudentApi(sid, student.data)
        }
    }
    return {
        permission,
        studentModal,
        modalType,
        student,
        handleOnSubmitStudent,
        handleCloseButton,
        handleDateOfBirthChange,
        handleOnChangeStudent,
        handleClassGroupChange,
        handleTagIdsChange,
        handleActiveChange,
    }
}

export default ModalLogic;
