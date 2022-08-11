import axios from 'axios';
import { useState } from 'react'
import { addStudent, editStudent, getFamilyMembers, getNationalities, getSingleStudent, getStudents } from '../../API';
import ShowToast from '../../Components/ShowToast';

const PageLogic = () => {

    const initialStudent = {
        type: '',
        data: {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            nationality: ''
        }
    }

    const [showModel, setShowModel] = useState(false);
    const [studentsList, setStudentsList] = useState([])  // useeffect to get all students from the server
    const [student, setStudent] = useState(initialStudent)
    const [nationalities, setNationalities] = useState([])
    const header = ['#', 'Name', 'Date of Birth', 'Actions']

    const toggleModal = () => {
        setShowModel(!showModel)
        if (showModel !== false) {
            setStudent(initialStudent)
        }
    }

    const handleAddStudentBtn = () => {
        setStudent({ ...initialStudent, type: 'add' })
        setShowModel(true)
    }

    const handleEditStudentBtn = (id) => {
        getSingleStudent(id).then(res => {
            setStudent({ type: 'edit', data: res.data })
            setShowModel(true)
        }).catch(err => {
            console.log(err)
        }).finally(() => {
            console.log('finally')
        })
    }

    const GetStudentsListAndNationalities = async () => {
        await axios.all([getStudents, getNationalities]).then(axios.spread((...responses) => {
            setStudentsList(responses[0].data);
            setNationalities(responses[1].data);
        })).catch(errors => {
            console.log(errors);
        })
    }

    const viewStudentsDetailes = async (id) => {
        await axios.all([getSingleStudent(id), getFamilyMembers(id)]).then(axios.spread((...responses) => {
            setShowModel(true)
            console.log(responses)
            setStudent({ ...student, type: 'view', data: responses[0].data, FamilyMembers: responses[1].data });
            // setStudent({ ...student,  });

        })).catch(errors => {
            console.log(errors);
        })
    }

    const handleOnChangeStudent = (e) => {
        setStudent(student => ({
            ...student,
            data: { ...student.data, [e.target.name]: e.target.value }
        }))
        console.log(student);

    }
    const handleDateOfBirthChange = (date) => {
        setStudent(student => ({
            ...student,
            data: { ...student.data, dateOfBirth: date }
        }))
        console.log(student);
    }

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
            editStudent(student.data.ID, student.data).then(resp => {
                // find the index of the student and update the student in the array
                setStudentsList(studentsList.map((item) => item.ID === student.data.ID ? resp.data : item));
                ShowToast('success', 'Student updated successfully')
            }).catch(err => {
                // show error message
                console.log(err);
            }).finally(() => {
                // close the modal
                toggleModal();
                // reset the student object
                setStudent(initialStudent);
            })
        }
    }

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

    return {
        showModel,
        studentsList,
        student,
        nationalities,
        header,
        setStudentsList,
        setNationalities,
        handleAddStudentBtn,
        handleEditStudentBtn,
        GetStudentsListAndNationalities,
        viewStudentsDetailes,
        handleOnChangeStudent,
        handleDateOfBirthChange,
        handleOnSubmitStudent,
        setShowModel,
        toggleModal,
        modalTitle,
    };
}

export default PageLogic