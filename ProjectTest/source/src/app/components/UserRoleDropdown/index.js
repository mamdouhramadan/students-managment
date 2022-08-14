import React, { useEffect, useState } from 'react'
import { roles } from '../../constants'
import userStore from '../../flux/UserStore'
import { dispatchData } from '../../helpers'
import './userRoleDropdown.css';


const UserRoleDropdown = ({ className }) => {
    const [currentRole, setCurrentRole] = useState(userStore.currentRole);
    // eslint-disable-next-line no-unused-vars
    const [permission, setPermission] = useState(userStore.permission);

    const handleOnChange = (e) => {
        dispatchData('UPDATE_ROLE', { currentRole: e.target.value })
        dispatchData('UPDATE_PERMISSION', { permission: roles.find(role => role.value === e.target.value).permissions })
    }

    useEffect(() => {
        userStore.on('change', () => {
            setCurrentRole(userStore.currentRole);
            setPermission(userStore.permission);
        })
    }, [])

    return (

        <select onChange={(e) => handleOnChange(e)} value={currentRole || ''} className={`select-role ${className ? className : ''}`}>
            <option value={''} disabled>Select Role</option>
            {
                roles.map((item, index) => {
                    return (
                        <option key={index} value={item.value} >
                            {item.text}
                        </option>
                    )
                })
            }
        </select>
    )
}

export default UserRoleDropdown