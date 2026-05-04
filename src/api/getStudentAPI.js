import {
    getSingleStudent,
    getFamilyMembers,
    getNationalities,
    getParentsByStudentId,
} from "./api"
import { studentActions } from "../helpers"
import ShowToast from "../components/ShowToast"
import studentStore from "../flux/StudentStore"
import { buildStudentModalShape, normalizeNationalities } from "./normalize"
import { pushRecentStudentId } from "../utils/recentStudents"

export const getStudentsDetails = async (id, type) => {
    try {
        let nationalities = studentStore.nationalities;
        if (!nationalities?.length) {
            const nRes = await getNationalities();
            nationalities = normalizeNationalities(nRes.data || []);
            studentActions.setNationalitiesList(nationalities);
        }
        const [studentRes, famRes, parentsRes] = await Promise.all([
            getSingleStudent(id),
            getFamilyMembers(id),
            getParentsByStudentId(id),
        ]);
        const studentRow = studentRes.data;
        const numericId = studentRow?.id ?? studentRow?.ID ?? id;
        if (numericId != null) {
            pushRecentStudentId(numericId);
        }
        const shape = buildStudentModalShape(
            studentRow,
            famRes.data || [],
            nationalities,
            parentsRes.data || []
        );
        studentActions.updateStudent(shape);
        studentActions.openStudentModal({ type, status: true });
    } catch (errors) {
        console.log(errors);
        ShowToast('error', errors?.response?.data?.message || 'Could not load student details');
    }
}
