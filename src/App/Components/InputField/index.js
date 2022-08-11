import { MDBInputGroup } from 'mdb-react-ui-kit'
import DateFnsUtils from "@date-io/date-fns"; // import
import { alpha } from '@material-ui/core/styles'
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";


import React from 'react'
import moment from 'moment';


const InputField = ({ readOnly, type, label, options, icon, onChange, value, name, handleDateChange, selectedDate }) => {

    switch (type) {
        case 'text':
            return (
                <div className='form-group'>
                    <label>{label}</label>
                    <MDBInputGroup textBefore={<ion-icon name={icon}></ion-icon>} className='mb-3'>
                        <input
                            name={name}
                            readOnly={readOnly}
                            onChange={onChange}
                            className='form-control'
                            type={type || 'text'}
                            placeholder={label}
                            value={value || ''}
                        />
                    </MDBInputGroup>
                </div>
            )
        case 'select':
            return (
                <div className='form-group'>
                    <label>{label}</label>
                    <MDBInputGroup textBefore={<ion-icon name={icon}></ion-icon>} className='mb-3'>
                        {
                            options &&
                            <select
                                name={name}
                                readOnly={readOnly}
                                onChange={onChange}
                                className='form-control'
                                type={type || 'text'}
                                placeholder={label}
                                defaultValue={value?.Title || 0}
                            >
                                <option value={0} disabled >{`Select ${label}`}</option>
                                {
                                    options?.map(((item, index) => {
                                        return <option key={index} value={item.ID}>{item.Title}</option>
                                    }))
                                }
                            </select>
                        }
                    </MDBInputGroup>
                </div>
            )
        case 'date':
            return (
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <div className='form-group'>
                        <label>{label}</label>
                        <MDBInputGroup textBefore={<ion-icon name={icon}></ion-icon>} className='mb-3'>
                            <DatePicker
                                className='form-control'
                                disableFuture
                                openTo="year"
                                name={name}
                                format="dd/MM/yyyy"
                                //label="Date of birth"
                                views={["year", "month", "date"]}
                                value={moment(selectedDate ? selectedDate : new Date()).format('L')}
                                readOnly={readOnly}
                                onChange={date => handleDateChange(date)}
                            />
                        </MDBInputGroup>
                    </div>
                </MuiPickersUtilsProvider>
            )
        default:
        // code block
    }


}

export default InputField