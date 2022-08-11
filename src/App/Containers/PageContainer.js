import { MDBContainer } from 'mdb-react-ui-kit'
import React from 'react'
import Footer from '../Components/Footer'
import Header from '../Components/Header'

const PageContainer = ({ children }) => {
    return (
        <React.Fragment>
            <Header />
            <main className='main-content'>
                <MDBContainer >
                    {children}
                </MDBContainer>
            </main>
            <Footer />
        </React.Fragment>
    )
}

export default PageContainer