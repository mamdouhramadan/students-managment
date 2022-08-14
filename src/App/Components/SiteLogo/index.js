import React from 'react'
import logo from '../../assets/images/logo.png';

const SiteLogo = ({ width, color }) => {
    return (
        <div className={`site-logo`}>
            <div className='d-flex align-items-center'>
                <img width={width || 50} src={logo} alt='mdb logo' className={`img-fluid ${color === 'light' && 'light-img'}`} />
                <span className={`logo-text mx-3 ${color === 'light' && 'light-text'}`}>School <br />Managment</span>
            </div>
        </div>
    )
}

export default SiteLogo