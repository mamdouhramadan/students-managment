import { MDBContainer } from 'mdb-react-ui-kit';
import React from 'react'
import './header.css'
import UserRoleDropdown from '../UserRoleDropdown';
import SiteLogo from '../SiteLogo';

const Header = () => {
    return (
        <header className='header main-header py-1'>
            <MDBContainer>
                <div className='d-flex justify-content-between align-items-center'>

                    <SiteLogo color={'light'}/>

                    <div className='d-flex justify-content-end align-items-center'>
                        <div className="user-profile ">
                            <img width={50} src="https://mdbootstrap.com/img/Photos/Avatars/img (20).jpg" alt="User Profile" className="img-fluid rounded-circle mx-3" />
                        </div>
                        <div className="user-detailes">
                            <h6 className='username'>Mamdoug Ramadan</h6>
                            <div className='select-dropdown select-role'>
                                <UserRoleDropdown />
                            </div>
                        </div>
                    </div>

                </div>

            </MDBContainer>
        </header>
    )
}
export default Header;