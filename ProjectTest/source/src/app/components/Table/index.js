import React, { useEffect, useState } from 'react';
import './table.css'
import { MDBTable, MDBTableHead, MDBTableBody, MDBBtn } from 'mdb-react-ui-kit';
import moment from 'moment';
import { ActionButton } from '../../components/ActionButton';
import { getStudentsDetails } from '../../api/getStudentAPI';
import userStore from '../../flux/UserStore';
import studentStore from '../../flux/StudentStore';
import getAllStudents from '../../api/getAllStudents';
import { dispatchData } from '../../helpers';
import getAllNationalities from '../../api/getAllNationalities';

const Table = ({ ...rest }) => {
    const [permission, setPermission] = useState(userStore.permission);
    const [studentList, setStudentList] = useState(studentStore.studentList);
    const [student, setStudent] = useState(studentStore._student);
    const header = ['#', 'Name', 'Date of Birth', 'Actions']
    const handleAddButton = () => {
        dispatchData('OPEN_STUDENT_MODAL', { type: 'add', status: true })
    }

    useEffect(() => {
        getAllStudents();
        getAllNationalities();
        userStore.on('change', () => {
            setPermission(userStore.permission);
            setStudent(studentStore._student);
        })
        studentStore.on('change', () => {
            setStudentList(studentStore.studentList);
        })
    }, [])

    return (
        <div className='main-table'>

            {
                studentStore.studentList.length > 0 ?
                    <MDBTable {...rest}>
                        <MDBTableHead>
                            <tr>
                                {header.map((item, index) => <th key={index} scope='col' className={`${(index - 1) === header.length && 'text-center'}`}>{item}</th>)}
                            </tr>
                        </MDBTableHead>
                        <MDBTableBody>

                            {
                                studentList.map((item, index) => {
                                    return (
                                        <tr key={item.ID}>
                                            <td>{index + 1}</td>
                                            <td>{`${item.firstName || ''} ${item.lastName || ''}`}</td>
                                            <td>{`${moment(item.dateOfBirth).format('L')}`}</td>
                                            <td width={100}>
                                                <ul className='action-list'>
                                                    {
                                                        permission && permission.includes('view') &&
                                                        <li>
                                                            <ActionButton label={'View'} icon={'eye'} onClick={() => getStudentsDetails(item.ID, 'view')} />
                                                        </li>
                                                    }
                                                    {

                                                        permission && permission.includes('edit') &&
                                                        <li>
                                                            <ActionButton label={'Edit'} icon={"create"} onClick={() => getStudentsDetails(item.ID, 'edit')} />
                                                        </li>
                                                    }
                                                </ul>
                                            </td>
                                        </tr>
                                    )
                                })}
                        </MDBTableBody>
                    </MDBTable >
                    :
                    <div className='bg-white p-5 my-3 text-center '>
                        <h5>No students found</h5>
                        {
                            permission && permission.includes('create') &&
                            <MDBBtn className='mt-3'
                                onClick={handleAddButton}
                            >Add New Student</MDBBtn>
                        }
                    </div>
            }
        </div >
    )
}

export default Table;