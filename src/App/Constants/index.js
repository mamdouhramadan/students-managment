export const API_URL = process.env.REACT_APP_SERVER_URL;


export const roles = {
    label: 'Roles',
    options: [
        {
            text: 'Admin',
            value: 'admin',
            permissions: ['view', 'edit', 'delete', 'create']
        },
        {
            text: 'Teacher',
            value: 'teacher',
            permissions: ['view']
        }
    ]
}

export const relationships = ['Parent', 'Sibling', 'Spouse']

export const studentForm = [
    {
        label: 'First Name',
        type: 'text',
        name: 'firstName',
        icon: 'person',
        // value: values?.firstName || '',
        readOnly: false,
        required: true,

    },
    {
        label: 'Last Name',
        type: 'text',
        name: 'lastName',
        icon: 'person',
        // value: values?.lastName || '',
        readOnly: false,
        required: true,

    },
    {
        label: 'Nationality',
        type: 'select',
        name: 'nationality',
        icon: 'globe',
        required: true,
        // value: values?.nationality || '',
        options: []
    },
    {
        label: 'Date Of Birth',
        type: 'date',
        name: 'dateOfBirth',
        icon: 'calendar',
        // value: values?.dateOfBirth || '',
        readOnly: false,
        required: true,
    }
]

export const FamilyForm = [
    {
        label: 'First Name',
        type: 'text',
        name: 'firstName',
        icon: 'person',
        // value: values?.firstName || '',
        readOnly: false,
        required: true,
    },
    {
        label: 'Last Name',
        type: 'text',
        name: 'lastName',
        icon: 'person',
        // value: values?.lastName || '',
        readOnly: false,
        required: true,

    },
    {
        label: 'Relation',
        type: 'select',
        name: 'relationship',
        icon: 'star',
        required: true,
        options: relationships
    },
    {
        label: 'Date Of Birth',
        type: 'date',
        name: 'dateOfBirth',
        icon: 'calendar',
        // value: values?.dateOfBirth || '',
        readOnly: false,
        required: true,
    }
]
