import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit'
import React from 'react'

export const ActionButton = ({ onClick, icon, label }) => {
    return (
        <MDBTooltip tag='span' title={label}>
            <MDBBtn className="action-btn" onClick={onClick}>
                <ion-icon name={icon}></ion-icon>
            </MDBBtn>
        </MDBTooltip>
    )
}
