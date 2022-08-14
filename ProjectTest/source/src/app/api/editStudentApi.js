import ShowToast from "../components/ShowToast"
import { initialStudent } from "../constants"
import studentStore from "../flux/StudentStore"
import { dispatchData } from "../helpers"
import { editStudent } from "./api"

export const editStudentApi = (id, data) => {
    const { studentList, _student } = studentStore;


    editStudent(id, data).then((resp) => {
        dispatchData('OPEN_STUDENT_MODAL', { type: 'edit', status: true })
        dispatchData('LOAD_STUDENT_LIST', studentStore.studentList.map(std => {
            if (std.ID === resp.data.ID) {
                std = resp.data
            }
            return std
        }))
     

    }).catch((error) => {
        console.log(error);
        dispatchData('OPEN_STUDENT_MODAL', { type: '', status: false })
        ShowToast('success', 'Somthing went wrong')
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