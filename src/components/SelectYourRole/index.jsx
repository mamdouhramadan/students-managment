import React, { useState } from 'react'
import { roles } from '../../constants';
import { userActions } from '../../helpers';
import SiteLogo from '../SiteLogo';
import './select-role.css';
import adminImg from '../../assets/images/admin.png';
import teacherImg from '../../assets/images/teacher.png';
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
} from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';

const SelectYourRole = () => {

    const [currentRole, setCurrentRole] = useState('admin');

    const handleOnSubmit = () => {
        userActions.updateRole(currentRole)
        userActions.updatePermission(roles.find(role => role.value === currentRole).permissions)
    }

    return (
        <div className='select-your-role'>
            <Box className="container" maxWidth="sm" sx={{ mx: 'auto', px: 2 }}>
                <div className="logo-container">
                    <SiteLogo />
                </div>
                <Card className="roles-container p-5 my-3 shadow-2" elevation={3}>
                    <CardContent>
                        <FormControl component="fieldset">
                            <RadioGroup
                                row
                                value={currentRole}
                                onChange={(e) => setCurrentRole(e.target.value)}
                                sx={{ justifyContent: 'center', gap: 2 }}
                            >
                                <FormControlLabel
                                    value="admin"
                                    control={<Radio />}
                                    label={
                                        <Box className="form-check-label shadow-2" sx={{ textAlign: 'center' }}>
                                            <img src={adminImg} alt="admin" style={{ maxWidth: 120, display: 'block', margin: '0 auto 8px' }} />
                                            <span>Admin</span>
                                        </Box>
                                    }
                                />
                                <FormControlLabel
                                    value="teacher"
                                    control={<Radio />}
                                    label={
                                        <Box className="form-check-label shadow-2" sx={{ textAlign: 'center' }}>
                                            <img src={teacherImg} alt="teacher" style={{ maxWidth: 120, display: 'block', margin: '0 auto 8px' }} />
                                            <span>Teacher</span>
                                        </Box>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>

                        <Typography className='mb-0 mt-4 text-center' align="center">
                            {
                                currentRole === 'admin' ?
                                    'You are an admin. You can manage all the users.'
                                    :
                                    'You are a teacher. You can only view your students.'
                            }
                        </Typography>
                    </CardContent>
                </Card>

                <Box display="flex" justifyContent="center">
                    <Button onClick={handleOnSubmit} className={'continue-btn'} variant="contained" size="large" endIcon={<ArrowForward />}>
                        Continue
                    </Button>
                </Box>
            </Box>
        </div>
    )
}

export default SelectYourRole
