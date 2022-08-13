import { type } from '@testing-library/user-event/dist/type';
import axios from 'axios';
import { useState } from 'react'
import { addFamilyMember, addStudent, deleteFamilyMember, editStudent, getFamilyMembers, getNationalities, getSingleStudent, getStudents, updateNationality } from '../../API';
import ShowToast from '../../components/ShowToast';

const PageLogic = () => {
    const initialData = {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: ''
    }

    const initialStudent = {
        type: '',
        data: { ...initialData },
        FamilyMembers: []
    }

    const initialFamily = {
        relationship: ''
    }

    const [loading, setLoading] = useState(true);
    const [showModel, setShowModel] = useState(false);
    const [studentsList, setStudentsList] = useState([])  // useeffect to get all students from the server
    const [student, setStudent] = useState(initialStudent)
    const [newFamilyMember, setNewFamilyMember] = useState({ ...initialFamily, ...initialData })
    const [nationalities, setNationalities] = useState([])
    const [showMemberForm, setshowMemberForm] = useState(false)
    const header = ['#', 'Name', 'Date of Birth', 'Actions']


    // ===================== Modal Function =====================
    const modalTitle = (type) => {
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

    // ========================== API Functions ==========================//

    // Get Specific Student Details
    const getStudentsDetails = async (id, type) => {
        setLoading(true)
        await axios.all([getSingleStudent(id), getFamilyMembers(id)]).then(axios.spread((...responses) => {
            setShowModel(true)
            console.log(responses)
            setStudent({ ...student, type, data: responses[0].data, FamilyMembers: responses[1].data });
            setTimeout(() => {
                setLoading(false)
            }, 1000);

        })).catch(errors => {
            console.log(errors);
            setLoading(false)
        })
    }

    // Get All Students and Nationalities
    const GetStudentsListAndNationalities = async () => {
        setLoading(true)
        await axios.all([getStudents, getNationalities]).then(axios.spread((...responses) => {
            setStudentsList(responses[0].data);
            setNationalities(responses[1].data);

            setLoading(false)


        })).catch(errors => {
            console.log(errors);
            setLoading(false)
        })
    }

    // Edit Student API
    const EditStudentAPI = () => {
        setLoading(true)
        editStudent(student.data.ID, student.data).then((resp) => {
            setShowModel(false)
            ShowToast('success', 'Student Edited Successfully')
            setStudentsList(studentsList.map(std => {
                if (std.ID === student.data.ID) {
                    std = student.data
                }
                return std
            }))
            
            toggleModal();
            // reset the student object
            setStudent(initialStudent);
            setLoading(false)
        }).catch((error) => {
            console.log(error);
            setLoading(false)
        })
    }

    // edit family member API
    const EditFamilyMemberAPI = (id, newMember) => {

        addFamilyMember(id, newMember).then(resp => {
            // update the students list
            setStudent({ ...student, FamilyMembers: student.FamilyMembers ? [...student.FamilyMembers, newMember] : [newMember] })
            console.log(newMember);
            ShowToast('success', 'Family Member Added Successfully')
            setNewFamilyMember({})
            setshowMemberForm(false)
        }).catch(err => {
            ShowToast('error', 'Error Adding Family Member')
            console.log(err);
        })


    }

    const deletFamilyMemberByID = (id) => {
        deleteFamilyMember(id).then(resp => {
            // update the students list
            setStudent({ ...student, FamilyMembers: student.FamilyMembers.filter(member => member.ID !== id) })
            ShowToast('success', 'Family Member Deleted Successfully')
        }).catch(err => {
            ShowToast('error', 'Error Deleting Family Member')
            console.log(err);
        })
    }

    // update nationality for Family Member
    const updateMemberNationality = (e,id) => {
        console.log('member.ID: ',id);
        console.log('e.target.value : ',e.target.value);
        updateNationality(id, e.target.value).then((res) => {
            // setStudent({ ...student, FamilyMembers: [...student.FamilyMembers, res.data] })
            ShowToast('success', 'Nationality Updated')
        }).catch(err => {
            ShowToast('Error', 'Error Updating Nationality ')
            console.log(err)
        })
    }


    // ========================== Toggle Functions ==========================//

    // Toggle Show Model
    const toggleModal = () => {
        setShowModel(!showModel)
        if (showModel !== false) {
            setStudent(initialStudent)
        }
    }

    // Toggle Family Member Form
    const toggleMemberForm = () => {
        setshowMemberForm(!showMemberForm)
    }

    // ========================== Student Functions ==========================//

    // Add New Button
    const handleAddStudentBtn = () => {
        setStudent({ ...initialStudent, type: 'add' })
        setShowModel(true)
    }

    // Edit Student Button
    const handleEditStudentBtn = (id) => {
        getStudentsDetails(id, 'edit')
    }

    const viewStudentsDetailes = async (id) => {
        getStudentsDetails(id, 'view')
    }

    const handleOnChangeStudent = (e) => {
        setStudent(student => ({ ...student, data: { ...student.data, [e.target.name]: e.target.value } }))
    }

    // Handle the birth date change for student
    const handleDateOfBirthChange = (date) => {
        setStudent(student => ({
            ...student,
            data: { ...student.data, dateOfBirth: date }
        }))
        console.log(student);
    }

    // ========================== Family Member Functions ==========================//

    // Handle on change for Family Member Inputs
    const handleOnChangeFamily = (e) => {
        if (e.target.name === 'nationality') {
            const object = nationalities.find(obj => obj.ID === Number(e.target.value));
            console.log('nationality: ', object)
            setNewFamilyMember({ ...newFamilyMember, [e.target.name]: object })
        } else {
            setNewFamilyMember({ ...newFamilyMember, [e.target.name]: e.target.value })
        }
    }

    // Handle the birth date change for family member
    const handleFamilyDateOfBirthChange = (date) => {
        setNewFamilyMember({ ...newFamilyMember, dateOfBirth: date })
        console.log(newFamilyMember);
    }


    // Handle ADD Family Member to Family Member List
    const handleAddFamilyMember = () => {
        if (student.type === 'edit') {
            // validation
            if (newFamilyMember.firstName === '' || newFamilyMember.lastName === '' || newFamilyMember.dateOfBirth === '' ) {
                ShowToast('error', 'Please fill all fields')
                return
            } else {
                EditFamilyMemberAPI(student.data.ID, newFamilyMember)
            }
            console.log(newFamilyMember);

        }

    }


    //==============================  ON Submit the Form (ADD / EDIR) ==============================//
    const handleOnSubmitStudent = async () => {

        // Check if the input is valid
        if (student.data.firstName === '' || student.data.lastName === '' || student.data.dateOfBirth === '') {
            alert('Please fill all the fields')
            return;
        }

        // check if the student is to be added or edited
        // 1- if the student is to be added, then add the student to the server
        if (student.type === 'add') {
            await addStudent(student.data).then(resp => {
                // update the students list
                setStudentsList([...studentsList, resp.data]);
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                // close the modal
                toggleModal();
                // reset the student data
                setStudent(initialStudent);
                // show toast message
                ShowToast('success', 'Student Added Successfully');
            })

        } else if (student.type === 'edit') { // if student is to be edited, then edit the student details in the server
            EditStudentAPI();
            // EditFamilyMemberAPI();
        }
    }

    return {
        loading,
        showModel,
        studentsList,
        student,
        nationalities,
        header,
        newFamilyMember,
        setStudentsList,
        setNationalities,
        handleAddStudentBtn,
        handleEditStudentBtn,
        GetStudentsListAndNationalities,
        viewStudentsDetailes,
        handleOnChangeStudent,
        handleOnChangeFamily,
        handleDateOfBirthChange,
        handleOnSubmitStudent,
        setShowModel,
        toggleModal,
        modalTitle,
        handleFamilyDateOfBirthChange,
        handleAddFamilyMember,
        showMemberForm,
        toggleMemberForm,
        deletFamilyMemberByID,
        updateMemberNationality
    };
}

export default PageLogic