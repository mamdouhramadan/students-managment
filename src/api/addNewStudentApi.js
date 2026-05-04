import { addStudent } from "./api"
import { studentActions } from "../helpers"
import studentStore from "../flux/StudentStore"
import ShowToast from "../components/ShowToast"
import { initialStudentStore } from "../constants"
import { studentPayloadFromForm, withLegacyId } from "./normalize"


export const addNewStudentApi = async (data) => {
    const payload = studentPayloadFromForm(data);
    await addStudent(payload).then(resp => {
        studentActions.loadStudentList([...studentStore.studentList, withLegacyId(resp.data)])
        studentActions.openStudentModal({ type: 'view', status: false })
        studentActions.updateStudent(initialStudentStore)
        ShowToast('success', 'Student added successfully');
    }).catch(err => {
        console.log(err);
        ShowToast('error', err?.response?.data?.message || 'Could not add student');
    })
}
