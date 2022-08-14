import { MDBInputGroup } from 'mdb-react-ui-kit'
import DateFnsUtils from "@date-io/date-fns"; // import
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import React from 'react'
import moment from 'moment';

const InputField = ({ form, type, options,readOnly,  onChange, value, handleDateChange, selectedDate }) => {

    switch (form.type) {
        case 'text':
            return (
                
                <div className='form-group'>
                    <label>{form.label}</label>
                    <MDBInputGroup textBefore={<ion-icon name={form.icon}></ion-icon>} className='mb-3'>
                        <input
                            name={form.name}
                            readOnly={readOnly}
                            onChange={onChange}
                            className='form-control'
                            type={form.type || 'text'}
                            placeholder={form.label}
                            value={value || ''}

                        />
                    </MDBInputGroup>
                </div>
            )
        case 'select':
            return (
                <div className='form-group'>
                    <label>{form.label}</label>
                    <MDBInputGroup textBefore={<ion-icon name={form.icon}></ion-icon>} className='mb-3'>
                        {
                            options &&
                            <select
                                name={form.name}
                                readOnly={readOnly}
                                onChange={onChange}
                                className='form-control'
                                type={form.type || 'text'}
                                placeholder={form.label}
                                defaultValue={value?.Title || 0}
                            >
                                <option value={0} disabled >{`Select ${form.label}`}</option>
                                {
                                    options?.map(((item, index) => {
                                        return <option key={index} value={item.ID|| item}>{item.Title || item}</option>
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
                        <label>{form.label}</label>
                        <MDBInputGroup textBefore={<ion-icon name={form.icon}></ion-icon>} className='mb-3'>
                            <DatePicker
                                className='form-control'
                                disableFuture
                                openTo="year"
                                name={form.name}
                                format="dd/MM/yyyy"
                                //label="Date of birth"
                                views={["year", "month", "date"]}
                                value={selectedDate ? moment(selectedDate ).format('L') : null}
                                readOnly={readOnly}
                                onChange={date => handleDateChange(date)}
                                emptyLabel={form.label} //<--- custom placeholder when date is null

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