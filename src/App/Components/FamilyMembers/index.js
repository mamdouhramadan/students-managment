import { MDBBtn } from 'mdb-react-ui-kit'
import moment from 'moment'
import React, { useState } from 'react'
import { FamilyForm } from '../../Constants'
import InputField from '../InputField'
import './FamilyMembers.css'

const FamilyMembers = ({ type, title, members, handleDateChange, onChange }) => {
    const [showMemberForm, setshowMemberForm] = useState(false)
    const handleToggle = () => {
        setshowMemberForm(!showMemberForm)
    }

    return (
        <div className="FamilyMembers">
            <div className='d-flex justify-content-between align-items-center'>
                <h5> {title}</h5>
                {
                    !showMemberForm ?
                        <MDBBtn onClick={handleToggle} className="add-btn">
                            <ion-icon name="add-outline" className="text-white"></ion-icon>
                            <span className='mx-2'>Add New</span>
                        </MDBBtn>
                        :
                        <MDBBtn className='close-btn btn-light text-danger' color='secondary' onClick={handleToggle}>
                            <ion-icon name="close-outline"></ion-icon>
                        </MDBBtn>
                }

            </div>

            {
                type !== 'view' &&
                <div className='form-group'>
                    {/* <InputField label={"first Name"} type={'text'} icon={"person"} value={''} /> */}
                </div>
            }

            {
                showMemberForm &&
                <div className='form-group'>
                    {
                        FamilyForm.map((item, index) =>
                            <InputField
                                key={index}
                                label={item?.label}
                                type={item?.type}
                                icon={item?.icon}
                                name={item?.name}
                                onChange={onchange}
                                value={members?.FamilyMembers[item.name] || null}
                                readOnly={members?.type === 'view' || item.readOnly}
                                options={item?.options}
                                handleDateChange={handleDateChange}
                            // selectedDate={members['dateOfBirth'] || null}
                            />
                        )
                    }
                </div>
            }

            {
                members ?
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Nationality</th>
                                <th>Date Of Birth</th>
                                <th>Relationship</th>
                                <th> Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{`${item.firstName} ${item.lastName}`}</td>
                                        <td>{`${item.nationality.Title}`}</td>
                                        <td>{`${moment(item.dateOfBirth).format('L')}`}</td>
                                        <td>{`${item.relationship}`}</td>
                                    </tr>
                                )
                            })}
                        </tbody>

                    </table>
                    :
                    <div className='p-3 text-center bg-light'>
                        <h6> No Members Found </h6>
                    </div>
            }
        </div >
    )
}

export default FamilyMembers