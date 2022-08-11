import React, { useEffect } from 'react'
import Table from '../../Components/Table';
import PageContainer from '../../Containers/PageContainer';
import { MDBBtn, MDBCol, MDBRow } from 'mdb-react-ui-kit';
import AppModal from '../../Components/Modal';
import InputField from '../../Components/InputField';
import { ActionButton } from '../../Components/ActionButton';
import { studentForm } from '../../Constants';
import moment from 'moment';
import PageLogic from './page.logic';
import Breadcrumbs from '../../Components/Breadcrumbs';
import FamilyMembers from '../../Components/FamilyMembers';

const LandingPage = () => {
    const { showModel, studentsList, student, nationalities, header, GetStudentsListAndNationalities, handleAddStudentBtn, handleEditStudentBtn, viewStudentsDetailes, handleOnChangeStudent, handleDateOfBirthChange, handleOnSubmitStudent, setShowModel, toggleModal, modalTitle } = PageLogic();
    const pageTitle = 'Students';

    useEffect(() => {
        GetStudentsListAndNationalities()
    }, []);

    return (
        <PageContainer>
            <div className='mb-5'>
                <Breadcrumbs title={pageTitle} button={<MDBBtn onClick={handleAddStudentBtn}>Add Student</MDBBtn>} />
                {
                    studentsList.length > 0 ?
                        <Table header={header}>
                            {studentsList.map((item, index) => {
                                return (
                                    <tr key={item.ID}>
                                        <td>{index + 1}</td>
                                        <td>{`${item.firstName || ''} ${item.lastName || ''}`}</td>
                                        <td>{`${moment(item.dateOfBirth).format('L')}`}</td>
                                        <td width={100}>
                                            <ul className='action-list'>
                                                <li>
                                                    <ActionButton icon={'eye'} onClick={() => viewStudentsDetailes(item.ID)} />
                                                </li>
                                                <li>
                                                    <ActionButton icon={'create'} onClick={() => handleEditStudentBtn(item.ID)} />
                                                </li>
                                            </ul>
                                        </td>
                                    </tr>
                                )
                            })}

                        </Table>
                        :
                        <div className='bg-light p-4 my-3 text-center '>
                            <h5>No students found</h5>
                            <MDBBtn className='mt-3' onClick={handleAddStudentBtn}>Add New Student</MDBBtn>
                        </div>
                }

                <pre>
                    {JSON.stringify(student, null, 2)}
                </pre>

                {/* Add Student Modal */}
                <AppModal showModel={showModel} setShow={setShowModel} toggleShowModel={toggleModal} modalTitle={modalTitle(student?.type)} onSubmit={handleOnSubmitStudent}>
                    <MDBRow>
                        {
                            studentForm.map((item, index) => {
                                return (
                                    <MDBCol size='12' sm='6' key={index}>
                                        <InputField
                                            label={item.label}
                                            type={item.type}
                                            icon={item.icon}
                                            name={item.name}
                                            onChange={handleOnChangeStudent}
                                            value={student?.data[item.name] || null}
                                            readOnly={student?.type === 'view' || item.readOnly}
                                            options={nationalities}
                                            handleDateChange={handleDateOfBirthChange}
                                            selectedDate={student?.data['dateOfBirth'] || null}
                                        />
                                    </MDBCol>
                                )
                            })
                        }
                    </MDBRow>
                    <hr />
                    <FamilyMembers title={'Family Members'} members={student?.FamilyMembers} />
                </AppModal>

            </div>
        </PageContainer >


    )
}

export default LandingPage