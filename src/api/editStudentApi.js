import ShowToast from "../components/ShowToast"
import { initialStudentStore } from "../constants"
import studentStore from "../flux/StudentStore"
import { studentActions } from "../helpers"
import { editStudent } from "./api"
import { studentPayloadFromForm, withLegacyId } from "./normalize"

export const editStudentApi = (id, data) => {
    const payload = studentPayloadFromForm(data);

    editStudent(id, payload).then((resp) => {
        const updated = studentStore.studentList.map((std) =>
            std.id === resp.data.id ? withLegacyId(resp.data) : std
        );
        studentActions.loadStudentList(updated)
        studentActions.openStudentModal({ type: 'view', status: false })
        studentActions.updateStudent(initialStudentStore)
        ShowToast('success', 'Student updated successfully');
    }).catch((error) => {
        console.log(error);
        ShowToast('error', error?.response?.data?.message || 'Could not update student');
    })
}
