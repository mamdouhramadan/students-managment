import { MDBContainer, MDBDropdown, MDBDropdownItem, MDBDropdownLink, MDBDropdownMenu, MDBDropdownToggle } from 'mdb-react-ui-kit';
import React from 'react'
import './header.css'
import logo from './../../Assets/images/logo.png';
import DropdownMenu from '../DropdownMenu';
import { roles } from '../../constants';

const Header = () => {
    return (
        <header className='header main-header py-1'>
            <MDBContainer>
                <div className='d-flex justify-content-between align-items-center'>
                    <div className='site-logo'>
                        <div className='d-flex align-items-center'>
                            <img width={50} src={logo} alt='mdb logo' className='img-fluid' />
                            <span className='mx-3'>School <br />Managment</span>
                        </div>
                    </div>

                    <div className='d-flex justify-content-end align-items-center'>
                        <div className="user-profile ">
                            <img width={50} src="https://mdbootstrap.com/img/Photos/Avatars/img (20).jpg" alt="User Profile" className="img-fluid rounded-circle mx-3" />
                        </div>
                        <div className="user-detailes">
                            <h6 className='username'>Mamdoug Ramadan</h6>
                            <div className='select-dropdown select-role'>
                                <DropdownMenu roles={roles} />
                            </div>
                        </div>
                    </div>

                </div>

            </MDBContainer>
        </header>
    )
}
export default Header;