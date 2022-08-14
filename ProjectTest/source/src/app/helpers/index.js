import dispatchers from '../flux/dispatchers'

export const dispatchData = (type, data) => {
    dispatchers.dispatch({
        type: type,
        payload: data
    })
}
// Set Student Modal Title
export const setModalTitle = (type) => {
    switch (type) {
        case 'add':
            return 'Add Student';
        case 'edit':
            return 'Edit Student';
        case 'view':
            return 'Student Detailes';
        default:
            return 'Add Student';
    }
}