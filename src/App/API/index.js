import axios from "axios";
import { API_URL } from "../constants";

// Get all students 
export const getStudents = axios.get(`${API_URL}/students`)

// Get Particular Student
export const getSingleStudent = (id) => axios.get(`${API_URL}/students/${id}`)

// Get All Nationalities
export const getNationalities = axios.get(`${API_URL}/Nationalities`)

// Add Student
export const addStudent = (student) => axios.post(`${API_URL}/Students`, student)

// Edit Student
export const editStudent = (id, student) => axios.put(`${API_URL}/Students/${id}`, student)

// Get Family Members For Particular Student
export const getFamilyMembers = (id) => axios.get(`${API_URL}/Students/${id}/FamilyMembers`)

// Add Family Member
export const addFamilyMember = (id, familyMember) => axios.post(
    `${API_URL}/Students/${id}/FamilyMembers`,
    JSON.stringify(familyMember),
    { headers: { "Content-Type": "application/json" } }
)

// Add Family Member
export const deleteFamilyMember = (id) => axios.delete(`${API_URL}/FamilyMembers/${id}`)

// Change THe nationality of the Family Member 
export const updateNationality = (stdID, nationalityID) => axios.put(`${API_URL}/FamilyMembers/${stdID}/Nationality/${nationalityID}`)