import React from 'react'
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Home from '@mui/icons-material/Home';
import { studentActions } from '../../helpers'
import { useAuth } from '../../hooks/useAuth';

function AppBreadcrumbs({ title }) {
    const { canCreate } = useAuth();

    const handleAddButton = () => {
        studentActions.openStudentModal({ type: 'add', status: true })
    }

    return (
        <div className='breadcrumb'>
            <Box className='breadcrumb-ligh p-3 my-4' sx={{ px: 2, py: 2, my: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Box>
                        <Breadcrumbs aria-label="breadcrumb">
                            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Home fontSize="small" />
                                Home
                            </Typography>
                            <Typography color="text.primary">{title}</Typography>
                        </Breadcrumbs>
                    </Box>
                    {
                        canCreate &&
                        <Button variant="contained" onClick={handleAddButton}>Add Student</Button>
                    }
                </Box>
            </Box>
        </div>
    )
}

export default AppBreadcrumbs
