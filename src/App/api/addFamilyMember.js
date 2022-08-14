import ShowToast from '../components/ShowToast'
import studentStore from '../flux/StudentStore'
import { dispatchData } from '../helpers'
import axios from 'axios'
import { API_URL } from '../constants'
const addFamilyMember = (id, newMember) => {

    const headers = { "Content-Type": "application/json" };

    axios.post(
        `${API_URL}/Students/${id}/FamilyMembers`,
        JSON.stringify(newMember),
        { headers: headers }
    ).then(resp => {
        ShowToast('success', 'Family Member Added Successfully')
        
        dispatchData('UPDATE_STUDENT', { ...studentStore._student, FamilyMembers: studentStore._student ? [...studentStore._student.FamilyMembers, resp.data] : [resp.data] })
        dispatchData('UPDATE_NEW_FAMILY_MEMBER', {});
       // dispatchData('OPEN_STUDENT_MODAL', { type: 'view', status: false });
        //setshowMemberForm(false)
       
    }).catch(err => {
        ShowToast('error', 'Error Adding Family Member')
        console.log(err);
    })
}

export default addFamilyMember