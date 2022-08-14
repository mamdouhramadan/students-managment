import React from 'react';
import { MDBBtn, MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBModalFooter, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import studentStore from '../../flux/StudentStore';
import { setModalTitle } from '../../helpers';
import InputField from '../InputField';
import ModalLogic from './modal.logic';
import { studentForm } from '../../constants';
import FamilyMembers from '../FamilyMembers';

export default function AppModal() {

    const {
        permission,
        showModal,
        setShowModal,
        modalType,
        student,
        handleOnSubmitStudent,
        handleCloseButton,
        handleDateOfBirthChange,
        handleOnChangeStudent
    } = ModalLogic()

    return (
        <>
            <MDBModal show={showModal || false} setShow={setShowModal} tabIndex='-1' className='main-modal'>
                <MDBModalDialog>
                    <MDBModalContent>
                        <MDBModalHeader>
                            <MDBModalTitle>{setModalTitle(modalType)}</MDBModalTitle>
                            <MDBBtn className='btn-close' color='none' onClick={handleCloseButton}></MDBBtn>
                        </MDBModalHeader>
                        <MDBModalBody>
                            <MDBRow>
                                {
                                    studentForm.map((item, index) => {
                                        return (
                                            <MDBCol size='12' sm='6' key={index}>
                                                <InputField
                                                    form={item}
                                                    onChange={handleOnChangeStudent}
                                                    value={student?.data[item.name] || null}
                                                    readOnly={modalType === 'view' || item.readOnly}
                                                    options={studentStore.nationalities}
                                                    handleDateChange={handleDateOfBirthChange}
                                                    selectedDate={student?.data['dateOfBirth'] || null}
                                                />

                                            </MDBCol>
                                        )
                                    })
                                }
                            </MDBRow>
                            {
                                modalType !== 'add' &&
                                <>
                                    <hr />
                                    <FamilyMembers
                                        familyMembers={student?.FamilyMembers}
                                        options={studentStore.nationalities}
                                        type={modalType}
                                    />
                                </>
                            }
                        </MDBModalBody>

                        <MDBModalFooter>
                            <MDBBtn className='text-dark' color='light' onClick={handleCloseButton}>
                                Close
                            </MDBBtn>
                            {permission && permission.includes('create') && studentStore.studentModal.type !== 'view' &&
                                <MDBBtn onClick={handleOnSubmitStudent}>Save changes</MDBBtn>
                            }
                        </MDBModalFooter>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </>

    );
}