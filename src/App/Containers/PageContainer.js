import { MDBContainer } from 'mdb-react-ui-kit'
import React from 'react'
import Footer from '../components/Footer'
import Header from '../components/Header'

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