import dispatchers from "./dispatchers";
import { EventEmitter } from "events";
import { initialStudentStore } from "../constants";

class StudentStore extends EventEmitter {
    studentList = [];
    _student = initialStudentStore;

    studentModal = { type: 'view', status: false };
    nationalities = []
    loading = true;
    newFamilyMember = {};



    setStudentList(studentList) {
        this.studentList = studentList;
        this.emit('change');
    }

    setStudentModal(studentModal) {
        this.studentModal = studentModal;
        this.emit('change');
    }

    setNationalities(nationalities) {
        this.nationalities = nationalities;
        this.emit('change');
    }

    setStudent(student) {
        this._student = student;
        this.emit('change');
    }

    setLoading(loading) {
        this.loading = loading;
        this.emit('change');
    }

    setNewFamilyMember(newFamilyMember) {
        this.newFamilyMember = newFamilyMember;
        this.emit('change');
    }


    handle(action) {
        switch (action.type) {
            case 'OPEN_STUDENT_MODAL':
                this.setStudentModal(action.payload);
                break;
            case 'LOAD_STUDENT_LIST':
                this.setStudentList(action.payload);
                break;
            case 'SET_NATIONALITIES_LIST':
                this.setNationalities(action.payload);
                break;
            case 'UPDATE_STUDENT':
                this.setStudent(action.payload);
                break;
            case 'UPDATE_LOADING':
                this.setLoading(action.payload);
                break;
            case 'UPDATE_NEW_FAMILY_MEMBER':
                this.setNewFamilyMember(action.payload);
                break;
            default:
                break;
        }
    }
}
const studentStore = new StudentStore();

dispatchers.register(studentStore.handle.bind(studentStore));

export default studentStore;