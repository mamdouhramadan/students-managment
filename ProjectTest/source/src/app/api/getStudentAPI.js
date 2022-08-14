import { getFamilyMembers, getSingleStudent } from "./api"
import axios from 'axios'
import { dispatchData } from "../helpers"

// Get Specific Student Details
export const getStudentsDetails = async (id, type) => {

    await axios.all([getSingleStudent(id), getFamilyMembers(id)]).then(axios.spread((...responses) => {

        const handleUpdateStudent = (student) => ({
            ...student,
            data: responses[0].data,
            FamilyMembers: responses[1].data
        })
        dispatchData('UPDATE_STUDENT', handleUpdateStudent(responses[0].data))
        dispatchData('OPEN_STUDENT_MODAL', { type: type, status: true })
    })).catch(errors => {
        console.log(errors);
    })
}