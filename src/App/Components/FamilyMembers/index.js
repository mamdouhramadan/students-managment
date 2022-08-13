import { MDBBtn, MDBCol, MDBRow } from 'mdb-react-ui-kit'
import moment from 'moment'
import React, { useState } from 'react'
import { deleteFamilyMember } from '../../api'
import { FamilyForm } from '../../constants'
import InputField from '../InputField'
import './FamilyMembers.css'

const FamilyMembers = ({ type, title, familyMembers, newMember, handleDateChange, onChange, options, addNewFamilyMember, showMemberForm, toggleMemberForm, deleteMember,updateNationality }) => {


    return (
        <div className="FamilyMembers">
            <div className='d-flex justify-content-between align-items-center mb-4'>
                <h5> {title}</h5>
                {
                    type !== 'view' &&
                    (
                        !showMemberForm ?
                            <MDBBtn onClick={toggleMemberForm} className="add-btn">
                                <ion-icon name="add-outline" className="text-white"></ion-icon>
                                <span className='mx-2'>Add New</span>
                            </MDBBtn>
                            :
                            <MDBBtn className='close-btn btn-light text-danger' color='secondary' onClick={toggleMemberForm}>
                                <ion-icon name="close-outline"></ion-icon>
                            </MDBBtn>
                    )
                }

            </div>
            {
                showMemberForm && type !== 'view' &&
                <MDBRow end className='mb-4'>

                    {/* <input value={newMember÷÷.firstName || ''} name={'firstName'} /> */}
                    {
                        FamilyForm.map((item, index) =>
                            <MDBCol size='12' sm='6' key={index}>
                                <InputField
                                    key={index}
                                    label={item?.label}
                                    type={item?.type}
                                    icon={item?.icon}
                                    name={item?.name}
                                    onChange={(e) => onChange(e)}
                                    value={newMember[item.name] || null}
                                    options={item.options || options}
                                    handleDateChange={handleDateChange}
                                    selectedDate={newMember['dateOfBirth'] || null}
                                />
                            </MDBCol>
                        )

                    }


                    <MDBCol size={6} className={"mt-4"}>
                        <MDBBtn color='secondary' className='btn-block' onClick={addNewFamilyMember}>Add New Member</MDBBtn>
                    </MDBCol>
                </MDBRow>
            }



            {
                familyMembers.length > 0 ?
                    <div className='table-responsive'>
                        <table className='table table-bordered table-sm text-center'>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Nationality</th>
                                    <th>Date Of Birth</th>
                                    <th>Relationship</th>
                                    <th> Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {familyMembers?.map((item, index) => {
                                    
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{`${item?.firstName} ${item?.lastName}`}</td>
                                            {
                                                type === 'view' ?
                                                    <td>{`${item?.nationality?.Title || '-'}`}</td>
                                                    :
                                                    <td>
                                                        <select onChange={(e)=>updateNationality(e,item.ID)} value={item.nationality.ID}>
                                                            <option value={0} disabled>Choose Nationality</option>
                                                            {
                                                                options.map((option, index) => {
                                                                    return (
                                                                        <option key={index} value={option.ID}>{option.Title}</option>
                                                                    )
                                                                })
                                                            }
                                                        </select>


                                                    </td>
                                            }
                                            <td>{`${moment(item.dateOfBirth).format('L')}`}</td>
                                            <td>{`${item.relationship}`}</td>
                                            <td><ion-icon onClick={() => deleteMember(item.ID)} name="close" style={{ color: '#c0392b', fontSize: 18 }} /></td>
                                        </tr>
                                    )
                                })}
                            </tbody>

                        </table>
                    </div>
                    :
                    <div className='p-3 text-center bg-light'>
                        <h6> No Members Found </h6>
                    </div>
            }
        </div >
    )
}

export default FamilyMembers