import { dispatchData } from '../helpers';
import { getNationalities } from './api';

const getAllNationalities = () => {
    getNationalities.then(res => {
        dispatchData('SET_NATIONALITIES_LIST', res.data)
        
    }).catch(err => {
        console.log(err);
        dispatchData('UPDATE_LOADING', false)
    }).finally(() => {
        dispatchData('UPDATE_LOADING', false)
    })
}

export default getAllNationalities