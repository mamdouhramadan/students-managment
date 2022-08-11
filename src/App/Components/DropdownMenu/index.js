import { MDBDropdown, MDBDropdownItem, MDBDropdownLink, MDBDropdownMenu, MDBDropdownToggle } from 'mdb-react-ui-kit'
import React from 'react'

const DropdownMenu = ({ roles }) => {
    return (
        <MDBDropdown>
            <MDBDropdownToggle>{roles.label || 'Dropdown button'}</MDBDropdownToggle>
            <MDBDropdownMenu>
                {
                    roles.options.map((item, index) => {
                        return (
                            <MDBDropdownItem key={index}>
                                <MDBDropdownLink data-vlue={item.value}>{item.text}</MDBDropdownLink>
                            </MDBDropdownItem>
                        )
                    })
                }
            </MDBDropdownMenu>
        </MDBDropdown >
    )
}

export default DropdownMenu