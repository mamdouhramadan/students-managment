import { useSyncExternalStore } from 'react';
import userStore from './UserStore';
import studentStore from './StudentStore';

function buildUserSnapshot() {
  return {
    currentRole: userStore.currentRole,
    permission: userStore.permission,
    authUser: userStore.authUser,
    token: userStore.token,
    isAuthenticated: userStore.isAuthenticated,
  };
}

let userSnapshot = buildUserSnapshot();

function subscribeUser(callback) {
  const handler = () => {
    userSnapshot = buildUserSnapshot();
    callback();
  };
  userStore.on('change', handler);
  return () => userStore.removeListener('change', handler);
}

function getUserSnapshot() {
  return userSnapshot;
}

export function useUserStore() {
  return useSyncExternalStore(subscribeUser, getUserSnapshot, getUserSnapshot);
}

function buildStudentSnapshot() {
  return {
    studentList: studentStore.studentList,
    loading: studentStore.loading,
    student: studentStore._student,
    studentModal: studentStore.studentModal,
    nationalities: studentStore.nationalities,
    newFamilyMember: studentStore.newFamilyMember,
  };
}

let studentSnapshot = buildStudentSnapshot();

function subscribeStudent(callback) {
  const handler = () => {
    studentSnapshot = buildStudentSnapshot();
    callback();
  };
  studentStore.on('change', handler);
  return () => studentStore.removeListener('change', handler);
}

function getStudentSnapshot() {
  return studentSnapshot;
}

export function useStudentStore() {
  return useSyncExternalStore(subscribeStudent, getStudentSnapshot, getStudentSnapshot);
}
