import React, { useEffect, useState } from 'react'
import { roles } from '../../constants';
import userStore from '../../flux/UserStore';
import { dispatchData } from '../../helpers';
import SiteLogo from '../SiteLogo';
import './select-role.css';
import adminImg from '../../assets/images/admin.png';
import teacherImg from '../../assets/images/teacher.png';
import { MDBBtn } from 'mdb-react-ui-kit';

const SelectYourRole = () => {

    const [currentRole, setCurrentRole] = useState(userStore.currentRole);
    // eslint-disable-next-line no-unused-vars
    const [permission, setPermission] = useState(userStore.permission);


    const handleOnSubmit = () => {
        dispatchData('UPDATE_ROLE', { currentRole: currentRole })
        dispatchData('UPDATE_PERMISSION', { permission: roles.find(role => role.value === currentRole).permissions })
    }

    useEffect(() => {
        userStore.on('change', () => {
            setCurrentRole(userStore.currentRole);
            setPermission(userStore.permission);
        })
    }, [])


    return (
        <div className='select-your-role'>
            <div className="container">
                <div className="logo-container">
                    <SiteLogo />
                </div>
                <div className="roles-container p-5 my-3 shadow-2">
                    <div className="d-flex align-items-center justify-content-center">
                        <div className="form-check form-check-inline">
                            <input onChange={(e) => setCurrentRole(e.target.value)} className="form-check-input" type="radio" name="inlineRadioOptions" id="admin" value="admin" />
                            <label className="form-check-label shadow-2" for="admin">
                                <img src={adminImg} alt="admin" />
                                <span>Admin</span>
                            </label>
                        </div>

                        <div className="form-check form-check-inline">
                            <input onChange={(e) => setCurrentRole(e.target.value)} className="form-check-input" type="radio" name="inlineRadioOptions" id="teacher" value="teacher" />
                            <label className="form-check-label shadow-2" for="teacher">
                                <img src={teacherImg} alt="admin" />
                                <span>Teacher</span>
                            </label>
                        </div>
                    </div>

                    <p className='mb-0 mt-4 text-center'>
                        {
                            currentRole === 'admin' ?
                                'You are an admin. You can manage all the users.'
                                :
                                'You are a teacher. You can  only View your students.'
                        }
                    </p>
                </div>

                <div className='d-flex justify-content-center'>
                    <MDBBtn onClick={handleOnSubmit} className={'continue-btn'}>
                        <span className='mx-2'>Continue</span>
                        <ion-icon  name="arrow-forward-outline"></ion-icon>
                    </MDBBtn>
                </div>
            </div>
        </div>
    )

}

export default SelectYourRole