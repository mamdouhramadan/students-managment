import React from 'react';
import './table.css'
import { MDBTable, MDBTableHead, MDBTableBody} from 'mdb-react-ui-kit';

const Table = ({ children,header, childen, onView, onEdit, onDelete, ...rest }) => {
    return (
        <div className='main-table'>
            <MDBTable {...rest}>
                <MDBTableHead>
                    <tr>
                        {
                            header.map((item, index) => <th key={index} scope='col'>{item}</th>)
                        }
                    </tr>
                </MDBTableHead>
                <MDBTableBody>
                    {children}
                </MDBTableBody>
            </MDBTable >
        </div >
    );
}

export default Table;