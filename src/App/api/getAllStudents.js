import { dispatchData } from '../helpers';
import { getStudents } from './api';

const getAllStudents = () => {
    getStudents.then(res => {
        dispatchData('LOAD_STUDENT_LIST', res.data)
    }).catch(err => {
        console.log(err);
        dispatchData('UPDATE_LOADING', false)
    }).finally(() => {
        dispatchData('UPDATE_LOADING', false)
    })
}

export default getAllStudents