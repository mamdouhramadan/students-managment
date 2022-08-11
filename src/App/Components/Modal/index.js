import React, { Children } from 'react';
import {
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter
} from 'mdb-react-ui-kit';

export default function AppModal({ children, onSubmit, modalTitle, showModel, toggleShowModel, setShow }) {

    return (
        <MDBModal show={showModel} setShow={setShow} tabIndex='-1' className='main-modal'>
            <MDBModalDialog>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle>{modalTitle}</MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShowModel}></MDBBtn>
                    </MDBModalHeader>
                    <MDBModalBody>
                        {children}
                    </MDBModalBody>

                    <MDBModalFooter>
                        <MDBBtn className='text-dark' color='light' onClick={toggleShowModel}>
                            Close
                        </MDBBtn>
                        <MDBBtn onClick={onSubmit}>Save changes</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>

    );
}