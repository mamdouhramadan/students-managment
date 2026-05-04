import React from 'react'
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PersonOutline from '@mui/icons-material/PersonOutline';
import Public from '@mui/icons-material/Public';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import StarOutline from '@mui/icons-material/StarOutline';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import NotesOutlined from '@mui/icons-material/NotesOutlined';

const iconFor = (name) => {
    switch (name) {
        case 'person':
            return <PersonOutline fontSize="small" />;
        case 'globe':
            return <Public fontSize="small" />;
        case 'calendar':
            return <CalendarMonth fontSize="small" />;
        case 'star':
            return <StarOutline fontSize="small" />;
        case 'home':
            return <HomeOutlined fontSize="small" />;
        case 'badge':
            return <BadgeOutlined fontSize="small" />;
        case 'email':
            return <EmailOutlined fontSize="small" />;
        case 'notes':
            return <NotesOutlined fontSize="small" />;
        default:
            return null;
    }
};

const InputField = ({ form, readOnly, onChange, value, handleDateChange, selectedDate, options }) => {

    const adornment = form.icon ? {
        startAdornment: (
            <InputAdornment position="start">
                {iconFor(form.icon)}
            </InputAdornment>
        ),
    } : {};

    switch (form.type) {
        case 'text':
            return (
                <TextField
                    fullWidth
                    margin="normal"
                    label={form.label}
                    name={form.name}
                    value={value ?? ''}
                    onChange={onChange}
                    InputProps={adornment}
                    inputProps={{ readOnly }}
                    type="text"
                    placeholder={form.label}
                />
            )
        case 'textarea':
            return (
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                    label={form.label}
                    name={form.name}
                    value={value ?? ''}
                    onChange={onChange}
                    InputProps={adornment}
                    inputProps={{ readOnly }}
                    placeholder={form.label}
                />
            )
        case 'select':
            return (
                <TextField
                    fullWidth
                    margin="normal"
                    select
                    label={form.label}
                    name={form.name}
                    value={
                        form.name === 'nationality'
                            ? (value?.ID ?? '')
                            : (value ?? '')
                    }
                    onChange={onChange}
                    InputProps={adornment}
                    inputProps={{ readOnly }}
                    SelectProps={{ native: true }}
                >
                    <option value="" disabled>{`Select ${form.label}`}</option>
                    {options?.map((item, index) => (
                        <option key={index} value={item.ID ?? item}>
                            {item.Title ?? item}
                        </option>
                    ))}
                </TextField>
            )
        case 'date': {
            let dateVal = null;
            if (selectedDate) {
                const d = new Date(selectedDate);
                dateVal = Number.isNaN(d.getTime()) ? null : d;
            }
            return (
                <DatePicker
                    label={form.label}
                    format="dd/MM/yyyy"
                    disableFuture
                    views={['year', 'month', 'day']}
                    openTo="year"
                    value={dateVal}
                    onChange={(date) => handleDateChange(date)}
                    readOnly={readOnly}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            margin: 'normal',
                            InputProps: adornment,
                        },
                        popper: {
                            sx: { zIndex: 1600 },
                        },
                    }}
                />
            )
        }
        default:
            return null;
    }
}

export default InputField
