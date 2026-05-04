import React from 'react'
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Visibility from '@mui/icons-material/Visibility';
import Edit from '@mui/icons-material/Edit';

const iconMap = {
    visibility: Visibility,
    eye: Visibility,
    edit: Edit,
    create: Edit,
};

export const ActionButton = ({ onClick, icon, label }) => {
    const IconComp = iconMap[icon] || Visibility;
    return (
        <Tooltip title={label}>
            <IconButton
                onClick={onClick}
                size="small"
                color="primary"
                aria-label={label}
                sx={{
                    color: 'text.secondary',
                    transition: (theme) =>
                        theme.transitions.create(['color', 'background-color'], {
                            duration: theme.transitions.duration.short,
                        }),
                    '&:hover': {
                        color: 'primary.contrastText',
                        bgcolor: 'primary.main',
                    },
                }}
            >
                <IconComp fontSize="small" />
            </IconButton>
        </Tooltip>
    )
}
