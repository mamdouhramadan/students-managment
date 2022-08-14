import ShowToast from "../components/ShowToast";
import studentStore from "../flux/StudentStore";
import { dispatchData } from "../helpers";
import { updateNationality } from "./api";

const updateMemberNationality = (e, id) => {

    updateNationality(id, e.target.value).then((res) => {

        dispatchData('UPDATE_STUDENT', {
            ...studentStore._student,
            FamilyMembers: [...res.data]
        });


        e.target.value = id

        ShowToast('success', 'Nationality Updated')
    }).catch(err => {
        ShowToast('Error', 'Error Updating Nationality ')
        console.log(err)
    })
}

export default updateMemberNationality