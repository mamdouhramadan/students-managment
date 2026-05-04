import React from 'react'
import { roles } from '../../constants'
import { userActions } from '../../helpers'
import './userRoleDropdown.css';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useUserStore } from '../../flux/useStores';


const UserRoleDropdown = ({ className }) => {
    const { currentRole } = useUserStore();

    const handleOnChange = (e) => {
        const value = e.target.value;
        userActions.updateRole(value)
        userActions.updatePermission(roles.find(role => role.value === value).permissions)
    }

    return (
        <FormControl size="small" className={className}>
            <Select
                onChange={handleOnChange}
                value={currentRole || ''}
                displayEmpty
                className={`select-role ${className ? className : ''}`}
            >
                <MenuItem value="" disabled>Select Role</MenuItem>
                {
                    roles.map((item, index) => (
                        <MenuItem key={index} value={item.value}>
                            {item.text}
                        </MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    )
}

export default UserRoleDropdown
