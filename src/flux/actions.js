import dispatchers from './dispatchers';
import { ActionTypes } from './actionTypes';

function dispatch(type, payload) {
  dispatchers.dispatch({ type, payload });
}

export const userActions = {
  loginSuccess(payload) {
    dispatch(ActionTypes.LOGIN_SUCCESS, payload);
  },
  updateAuthUser(payload) {
    dispatch(ActionTypes.UPDATE_AUTH_USER, payload);
  },
  logout() {
    dispatch(ActionTypes.LOGOUT);
  },
  updateRole(currentRole) {
    dispatch(ActionTypes.UPDATE_ROLE, { currentRole });
  },
  updatePermission(permission) {
    dispatch(ActionTypes.UPDATE_PERMISSION, { permission });
  },
};

export const studentActions = {
  openStudentModal(payload) {
    dispatch(ActionTypes.OPEN_STUDENT_MODAL, payload);
  },
  loadStudentList(payload) {
    dispatch(ActionTypes.LOAD_STUDENT_LIST, payload);
  },
  setNationalitiesList(payload) {
    dispatch(ActionTypes.SET_NATIONALITIES_LIST, payload);
  },
  updateStudent(payload) {
    dispatch(ActionTypes.UPDATE_STUDENT, payload);
  },
  updateLoading(payload) {
    dispatch(ActionTypes.UPDATE_LOADING, payload);
  },
  updateNewFamilyMember(payload) {
    dispatch(ActionTypes.UPDATE_NEW_FAMILY_MEMBER, payload);
  },
};
