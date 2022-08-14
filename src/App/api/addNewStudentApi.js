import { addStudent } from "./api"
import { dispatchData } from "../helpers"
import studentStore from "../flux/StudentStore"
import ShowToast from "../components/ShowToast"
import { initialStudent } from "../constants"


export const addNewStudentApi = async (data) => {
    await addStudent(data).then(resp => {
        // update the students list
        dispatchData('LOAD_STUDENT_LIST', [...studentStore.studentList, resp.data])
    }).catch(err => {
        console.log(err);
    }).finally(() => {
        // close the modal
        dispatchData('OPEN_STUDENT_MODAL', { type: '', status: false })
        // reset the student data
        // setStudent({ ...student, data: {} });
        dispatchData('UPDATE_STUDENT', initialStudent)
        // show toast message
        ShowToast('success', 'Student Added Successfully');
    })
}