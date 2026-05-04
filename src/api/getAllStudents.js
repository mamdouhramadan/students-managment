import { studentActions } from '../helpers';
import ShowToast from '../components/ShowToast';
import { getStudents } from './api';
import { withLegacyId } from './normalize';

const getAllStudents = () => {
    studentActions.updateLoading(true);
    getStudents().then(res => {
        const list = (res.data || []).map(withLegacyId);
        studentActions.loadStudentList(list)
    }).catch(err => {
        console.log(err);
        ShowToast('error', err?.response?.data?.message || 'Could not load students');
        studentActions.updateLoading(false);
    }).finally(() => {
        studentActions.updateLoading(false);
    })
}

export default getAllStudents
