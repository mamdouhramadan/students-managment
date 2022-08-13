import React, { useEffect, useState } from 'react'
import { roles } from '../../constants'
import dispatchers from '../../flux/dispatchers'
import userStore from '../../flux/UserStore'

const UserRoleDropdown = () => {
    const [currentRole, setCurrentRole] = useState(userStore.currentRole);

    const handleOnChange = (e) => {
        dispatchers.dispatch({
            type: 'Update_ROLE',
            payload: {
                currentRole: e.target.value,
                permissions: roles.find(role => role.value === e.target.value).permissions
            }
        })
    }

    // function to get object value by id

    const getUserPermissions = () => {
        const permissions = roles.find(item => item.value === 'admin').permissions;
        return permissions || []
    }


    useEffect(() => {
        userStore.on('change', () => {
            setCurrentRole(userStore.currentRole);
        })
    }, [currentRole])

    return (
        <>
            <select onChange={(e) => handleOnChange(e)} value={currentRole || ''}>
                <option value={''} >Select Role</option>
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
        </>
    )
}

export default UserRoleDropdown