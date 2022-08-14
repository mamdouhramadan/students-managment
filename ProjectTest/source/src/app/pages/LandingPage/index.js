import React, { useEffect } from 'react'
import Table from '../../components/Table';
import PageContainer from '../../containers/PageContainer';
import AppModal from '../../components/Modal';
import Breadcrumbs from '../../components/Breadcrumbs';
const LandingPage = () => {

    const pageTitle = 'Students';
    
    return (
        <PageContainer>
            <div className='mb-5'>
                <Breadcrumbs title={pageTitle} />
                {<Table />}
                {/* Add Student Modal */}
                <AppModal />

            </div>

        </PageContainer >
    )
}

export default LandingPage