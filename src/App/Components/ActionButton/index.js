import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit'
import React from 'react'

export const ActionButton = ({ onClick, icon }) => {
    return (
        <MDBTooltip tag='span' title="View">
            <MDBBtn className="action-btn" onClick={onClick}>
                <ion-icon name={icon}></ion-icon>
            </MDBBtn>
        </MDBTooltip>
    )
}
