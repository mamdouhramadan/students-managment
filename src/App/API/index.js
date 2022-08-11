import axios from "axios";
import { API_URL } from "../Constants";

// Get all students 
export const getStudents = axios.get(`${API_URL}/students`)

// Get Particular Student
export const getSingleStudent = (id) => axios.get(`${API_URL}/students/${id}`)

// Get All Nationalities
export const getNationalities = axios.get(`${API_URL}/Nationalities`)

// Add Student
export const addStudent = (student) => axios.post(`${API_URL}/Students`, student)

// Edit Student
export const editStudent = (id,student) => axios.put(`${API_URL}/Students/${id}`, student)

// Get Family Members For Particular Student
export const getFamilyMembers = (id) => axios.get(`${API_URL}/Students/${id}/FamilyMembers`)