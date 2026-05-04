import ShowToast from "../components/ShowToast";
import studentStore from "../flux/StudentStore";
import { studentActions } from "../helpers";
import { patchFamilyMember, getFamilyMembers } from "./api";
import { normalizeFamilyMember } from "./normalize";

const updateMemberNationality = (e, memberId) => {
    const nationalityId = Number(e.target.value);

    patchFamilyMember(memberId, { nationalityId }).then(async () => {
        const sid = studentStore._student.data?.id ?? studentStore._student.data?.ID;
        const res = await getFamilyMembers(sid);
        const fam = (res.data || []).map((m) =>
            normalizeFamilyMember(m, studentStore.nationalities)
        );
        studentActions.updateStudent({
            ...studentStore._student,
            FamilyMembers: fam,
        });

        ShowToast('success', 'Nationality updated')
    }).catch(err => {
        ShowToast('error', err?.response?.data?.message || 'Error updating nationality')
        console.log(err)
    })
}

export default updateMemberNationality
