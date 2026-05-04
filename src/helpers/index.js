import dispatchers from '../flux/dispatchers'

/** @deprecated Prefer studentActions / userActions from the same module */
export const dispatchData = (type, data) => {
    dispatchers.dispatch({
        type: type,
        payload: data
    })
}

export { ActionTypes } from '../flux/actionTypes'
export { studentActions, userActions } from '../flux/actions'

// Set Student Modal Title
export const setModalTitle = (type) => {
    switch (type) {
        case 'add':
            return 'Add Student';
        case 'edit':
            return 'Edit Student';
        case 'view':
            return 'Student Details';
        default:
            return 'Add Student';
    }
}
