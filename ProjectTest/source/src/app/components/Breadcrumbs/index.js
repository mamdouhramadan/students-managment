import { MDBBreadcrumb, MDBBreadcrumbItem, MDBCol, MDBContainer, MDBRow, MDBBtn } from 'mdb-react-ui-kit'
import React, { useState, useEffect } from 'react'
import userStore from '../../flux/UserStore';
import { dispatchData } from '../../helpers'


function Breadcrumbs({ title }) {
    const [permission, setPermission] = useState(userStore.permission);

    const handleAddButton = () => {
        dispatchData('OPEN_STUDENT_MODAL', { type: 'add', status: true })
    }

    useEffect(() => {
        userStore.on('change', () => {
            setPermission(userStore.permission);
        })
    }, [])


    return (
        <div className='breadcrumb'>
            <MDBContainer className='p-0'>
                <div className='breadcrumb-ligh p-3 my-4'>
                    <MDBRow className='align-items-center'>
                        <MDBCol>
                            <MDBBreadcrumb>
                                <MDBBreadcrumbItem>
                                    <ion-icon name="home"></ion-icon>
                                    <span className='mx-2'>Home</span>
                                </MDBBreadcrumbItem>
                                <MDBBreadcrumbItem active>{title}</MDBBreadcrumbItem>
                            </MDBBreadcrumb>
                        </MDBCol>
                        {
                            permission && permission.includes('create') &&
                            <MDBCol className='d-flex justify-content-end'>
                                <MDBBtn onClick={handleAddButton}>Add Student</MDBBtn>
                            </MDBCol>
                        }

                    </MDBRow>
                </div>
            </MDBContainer>
        </div>
    )

}

export default Breadcrumbs