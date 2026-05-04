import axios from "axios";
import { API_URL } from "../constants";
import { userActions } from "../helpers";

const baseConfig = { baseURL: API_URL || undefined };

/**
 * No JWT — login / signin and fully public routes only.
 * (Avoids attaching Authorization or triggering 401 logout on login failure.)
 */
export const publicClient = axios.create(baseConfig);

/**
 * All authenticated API traffic: sends Bearer token and handles invalid/expired sessions.
 */
export const apiClient = axios.create(baseConfig);

let handling401 = false;

apiClient.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      const path = window.location.pathname || "";
      const onLoginPage =
        path === "/login" || path.endsWith("/login");
      if (!onLoginPage && !handling401) {
        handling401 = true;
        userActions.logout();
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

/** json-server-auth: POST /login or /signin */
export const loginRequest = (body) => publicClient.post("/login", body);

/** No JWT — reads `siteSettings.primaryColorHex` for CSS / MUI brand */
export const getPublicSiteTheme = () =>
  publicClient.get("/api/public/site-theme");

export const getStudents = () => apiClient.get("/students");

export const getSingleStudent = (id) => apiClient.get(`/students/${id}`);

export const addStudent = (student) => apiClient.post("/students", student);

export const editStudent = (id, student) =>
  apiClient.put(`/students/${id}`, student);

export const deleteStudent = (id) => apiClient.delete(`/students/${id}`);

export const getNationalities = () => apiClient.get("/nationalities");

export const getFamilyMembers = (studentId) =>
  apiClient.get("/familyMembers", { params: { studentId } });

export const getAllFamilyMembers = () => apiClient.get("/familyMembers");

export const addFamilyMember = (payload) =>
  apiClient.post("/familyMembers", payload);

export const deleteFamilyMember = (id) =>
  apiClient.delete(`/familyMembers/${id}`);

export const patchFamilyMember = (id, body) =>
  apiClient.patch(`/familyMembers/${id}`, body);

export const getParents = () => apiClient.get("/parents");

export const getParentsByStudentId = (studentId) =>
  apiClient.get("/parents", { params: { studentId } });

export const getParent = (id) => apiClient.get(`/parents/${id}`);

export const addParent = (parent) => apiClient.post("/parents", parent);

export const editParent = (id, parent) =>
  apiClient.put(`/parents/${id}`, parent);

export const deleteParent = (id) => apiClient.delete(`/parents/${id}`);

export const patchMyProfile = (body) =>
  apiClient.patch("/api/me/profile", body);

export const changeMyPassword = (body) =>
  apiClient.post("/api/me/password", body);

export const getMe = () => apiClient.get("/api/me");

export const getMyReminders = () => apiClient.get("/api/me/reminders");

export const postMyReminder = (body) =>
  apiClient.post("/api/me/reminders", body);

export const patchMyReminder = (id, body) =>
  apiClient.patch(`/api/me/reminders/${id}`, body);

export const deleteMyReminder = (id) =>
  apiClient.delete(`/api/me/reminders/${id}`);

export const getAdminStats = () => apiClient.get("/api/admin/stats");

export const getAdminUsers = () => apiClient.get("/api/admin/users");

export const patchAdminUser = (id, body) =>
  apiClient.patch(`/api/admin/users/${id}`, body);

export const postAdminUser = (body) => apiClient.post("/api/admin/users", body);

export const deleteAdminUser = (id) =>
  apiClient.delete(`/api/admin/users/${id}`);

export const getAdminSiteSettings = () =>
  apiClient.get("/api/admin/settings");

export const patchAdminSiteSettings = (body) =>
  apiClient.patch("/api/admin/settings", body);

export const getTimetableConfig = () => apiClient.get("/api/timetable/config");

export const getTimetableForClass = (classGroupId) =>
  apiClient.get(`/api/timetable/class/${classGroupId}`);

export const putTimetableForClass = (classGroupId, body) =>
  apiClient.put(`/api/timetable/class/${classGroupId}`, body);

export const patchMyClassGroup = (body) =>
  apiClient.patch("/api/me/class-group", body);

export const postTimetableGrade = (body) =>
  apiClient.post("/api/timetable/grades", body);

export const patchTimetableGrade = (id, body) =>
  apiClient.patch(`/api/timetable/grades/${id}`, body);

export const deleteTimetableGrade = (id) =>
  apiClient.delete(`/api/timetable/grades/${id}`);

export const postTimetableClassGroup = (body) =>
  apiClient.post("/api/timetable/class-groups", body);

export const patchTimetableClassGroup = (id, body) =>
  apiClient.patch(`/api/timetable/class-groups/${id}`, body);

export const deleteTimetableClassGroup = (id) =>
  apiClient.delete(`/api/timetable/class-groups/${id}`);

export const getCourses = () => apiClient.get("/api/courses");

export const postCourse = (body) => apiClient.post("/api/courses", body);

export const patchCourse = (id, body) =>
  apiClient.patch(`/api/courses/${id}`, body);

export const deleteCourse = (id) => apiClient.delete(`/api/courses/${id}`);

export const getTimetableTeachers = () =>
  apiClient.get("/api/timetable/teachers");

export const getStudentTags = () => apiClient.get("/api/student-tags");

export const postStudentTag = (body) =>
  apiClient.post("/api/student-tags", body);

export const patchStudentTag = (id, body) =>
  apiClient.patch(`/api/student-tags/${id}`, body);

export const deleteStudentTag = (id) =>
  apiClient.delete(`/api/student-tags/${id}`);
