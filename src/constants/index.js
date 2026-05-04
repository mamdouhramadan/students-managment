export const API_URL = process.env.REACT_APP_SERVER_URL ?? '';

export const initialStudent = { data: {}, FamilyMembers: [], Parents: [] }

/** Teacher: full CRUD MVP; Student: read-only views; Admin: same app permissions + admin screens */
export const roles = [
    {
        text: 'Teacher',
        value: 'teacher',
        permissions: ['view', 'create', 'edit', 'delete']
    },
    {
        text: 'Student',
        value: 'student',
        permissions: ['view']
    },
    {
        text: 'Admin',
        value: 'admin',
        permissions: ['view', 'create', 'edit', 'delete']
    }
]

export function getPermissionsForRole(role) {
    const r = roles.find((x) => x.value === role);
    return r ? [...r.permissions] : [];
}

export const relationships = ['Parent', 'Sibling', 'Spouse']

export const studentForm = [
    {
        label: 'First Name',
        type: 'text',
        name: 'firstName',
        icon: 'person',
        readOnly: false,
        required: true,

    },
    {
        label: 'Last Name',
        type: 'text',
        name: 'lastName',
        icon: 'person',
        readOnly: false,
        required: true,

    },
    {
        label: 'Nationality',
        type: 'select',
        name: 'nationality',
        icon: 'globe',
        required: true,
        options: []
    },
    {
        label: 'Date Of Birth',
        type: 'date',
        name: 'dateOfBirth',
        icon: 'calendar',
        readOnly: false,
        required: true,
    },
    {
        label: 'Address',
        type: 'textarea',
        name: 'address',
        icon: 'home',
        required: false,
        fullWidth: true,
    },
    {
        label: 'Emirates ID (EID)',
        type: 'text',
        name: 'eid',
        icon: 'badge',
        required: false,
    },
    {
        label: 'Email',
        type: 'text',
        name: 'email',
        icon: 'email',
        required: false,
    },
    {
        label: 'Notes',
        type: 'textarea',
        name: 'notes',
        icon: 'notes',
        required: false,
        fullWidth: true,
    },
]

export const FamilyForm = [
    {
        label: 'First Name',
        type: 'text',
        name: 'firstName',
        icon: 'person',
        readOnly: false,
        required: true,
    },
    {
        label: 'Last Name',
        type: 'text',
        name: 'lastName',
        icon: 'person',
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
        readOnly: false,
        required: true,
    }
]



export const initialStudentStore = {
    data: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: '',
        address: '',
        eid: '',
        email: '',
        notes: '',
        classGroupId: null,
        active: true,
        tagIds: [],
    },
    FamilyMembers: [],
    Parents: []
}
