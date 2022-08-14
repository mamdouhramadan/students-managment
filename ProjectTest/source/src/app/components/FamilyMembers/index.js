import { MDBBtn, MDBCol, MDBRow } from 'mdb-react-ui-kit'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { FamilyForm } from '../../constants'
import studentStore from '../../flux/StudentStore'
import InputField from '../InputField';

import './FamilyMembers.css'
import updateMemberNationality from '../../api/updateMemberNationality'
import { deleteFamilyMember } from '../../api/api'
import  addFamilyMember from '../../api/addFamilyMember'
import ShowToast from '../ShowToast'
import { dispatchData } from '../../helpers'
import userStore from '../../flux/UserStore'

const FamilyMembers = ({ type, familyMembers, options }) => {


    const [showModal, setShowModal] = useState(false)
    const [familyMember, setFamilyMember] = useState({})
    const [student, setStudent] = useState(studentStore._student)
    const [newFamilyMember, setNewFamilyMember] = useState(studentStore.newFamilyMember)
    const [permission, setPermission] = useState(userStore.permission)

    const handleShowModal = () => setShowModal(!showModal);

    const handlelInputChange = (e) => {
        setFamilyMember({ ...newFamilyMember, [e.targetname]: e.target.value })

        if (e.targetname === 'nationality') {
            const nationality = studentStore.nationalities.find(obj => obj.ID === Number(e.target.value));
            dispatchData('UPDATE_NEW_FAMILY_MEMBER', { ...newFamilyMember, [e.target.name]: nationality })
        } else {
            dispatchData('UPDATE_NEW_FAMILY_MEMBER', { ...newFamilyMember, [e.target.name]: e.target.value })
            console.log(e.target.name)
            console.log(e.target.value)
        }
    }

    const handleDateChange = (date) => {
        setNewFamilyMember(({ ...newFamilyMember, dateOfBirth: date }))
    }

    const handleAddFamilyMember = async () => {
        // validate form
        const { firstName, relationship, lastName, dateOfBirth } = newFamilyMember;
        if (!firstName || !relationship || !lastName || !dateOfBirth) {
            ShowToast('error', 'Please fill in all fields')
            return;
        }
        addFamilyMember(student.data.ID, newFamilyMember)
        setShowModal(false)

    }

    const handleDeleteFamilyMember = async (id) => {
        // validate form
        deleteFamilyMember(id).then(() => {
            ShowToast('success', 'Family member deleted successfully')
            dispatchData('UPDATE_STUDENT', {
                ...studentStore._student,
                //   FamilyMembers: [studentStore._student.FamilyMembers.filter(item => item.ID !== id)]
                FamilyMembers: studentStore._student.FamilyMembers.filter(item => item.ID !== id)
            })

        }).catch(err => {
            ShowToast('error', err.message)
        }).finally(() => {
            setShowModal(false)
        })
    }

    useEffect(() => {
        userStore.on('change', () => {
            setPermission(userStore.permission)
        })
        studentStore.on('change', () => {
            setNewFamilyMember(studentStore.newFamilyMember)
            setStudent(studentStore._student)
        })
    }, []) 

    return (
        <div className="FamilyMembers">
            <div className='d-flex justify-content-between align-items-center mb-4'>
                <h5> Family Members</h5>
                {/* Start Family Member Form  */}
                {
                    type === 'edit' && permission.includes('edit') &&
                    (
                        !showModal ?
                            <MDBBtn onClick={handleShowModal} className="add-btn">
                                <ion-icon name="add-outline" className="text-white"></ion-icon>
                                <span className='mx-2'>Add New</span>
                            </MDBBtn>
                            :
                            <MDBBtn className='close-btn btn-light text-danger' color='secondary' onClick={handleShowModal}>
                                <ion-icon name="close-outline"></ion-icon>
                            </MDBBtn>
                    )
                }

            </div>
            {
                showModal && studentStore.studentModal.type === 'edit' &&
                <MDBRow end className='mb-4'>
                    {
                        FamilyForm.map((item, index) =>
                            <MDBCol size='12' sm='6' key={index}>
                                <InputField
                                    key={index}
                                    form={item}
                                    onChange={(e) => handlelInputChange(e)}
                                    value={newFamilyMember[item.name] || null}
                                    options={item.options || options}
                                    handleDateChange={handleDateChange}
                                    selectedDate={newFamilyMember['dateOfBirth'] || null}
                                />
                            </MDBCol>
                        )

                    }


                    <MDBCol size={6} className={"mt-4"}>
                        <MDBBtn color='secondary' className='btn-block' onClick={()=>handleAddFamilyMember(student.data.ID, newFamilyMember)}>Add New Member</MDBBtn>
                    </MDBCol>
                </MDBRow>
            }


            {/* Start Family Member Table  */}
            {
                familyMembers.length > 0 ?
                    <div className='table-responsive'>
                        <table className='table table-bordesred table-sm text-center'>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Nationality</th>
                                    <th>Date Of Birth</th>
                                    <th>Relationship</th>
                                    {
                                        type !== 'view' && permission.includes('edit')  &&
                                        <th className='text-center'> Action</th>
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {familyMembers?.map((item, index) => {

                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{`${item?.firstName} ${item?.lastName}`}</td>
                                            {
                                                type !== 'edit' &&
                                                <td>{`${item?.nationality?.Title || '-'}`}</td>
                                            }
                                            {
                                                type !== 'view' && permission.includes('edit') &&
                                                <td>
                                                    <select onChange={(e) => updateMemberNationality(e, item.ID)} value={item?.nationality?.ID || 0}>
                                                        <option value={0} disabled>Choose Nationality</option>
                                                        {
                                                            studentStore.nationalities.map((option, index) => {
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
                                            {
                                                type !== 'view' && permission.includes('edit') &&

                                                <td>
                                                    <ion-icon onClick={() => handleDeleteFamilyMember(item.ID)} name="close" style={{ color: '#c0392b', fontSize: 18 }} />
                                                </td>

                                            }
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