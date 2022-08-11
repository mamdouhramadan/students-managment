import { MDBBreadcrumb, MDBBreadcrumbItem, MDBCol, MDBContainer, MDBRow } from 'mdb-react-ui-kit'
import React from 'react'

function Breadcrumbs({ title, button }) {
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
                            button &&
                            <MDBCol className='d-flex justify-content-end'>
                                {button}
                            </MDBCol>
                        }

                    </MDBRow>
                </div>
            </MDBContainer>
        </div>
    )

}

export default Breadcrumbs