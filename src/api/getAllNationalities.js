import { studentActions } from '../helpers';
import ShowToast from '../components/ShowToast';
import { getNationalities } from './api';
import { normalizeNationalities } from './normalize';

const getAllNationalities = () => {
    getNationalities().then(res => {
        studentActions.setNationalitiesList(normalizeNationalities(res.data || []))
    }).catch(err => {
        console.log(err);
        ShowToast('error', err?.response?.data?.message || 'Could not load nationalities');
    })
}

export default getAllNationalities
