import dispatchers from "./dispatchers";
import { EventEmitter } from "events";

class StudentStore extends EventEmitter {
    studentList = [];
    student = {};


    setStudentList(studentList) {
        this.studentList = studentList;
        this.emit('change');
    }

    handle(action) {
        switch (action.type) {
            case 'LOAD_STUDENT_LIST':
                this.setStudentList(action.payload.students);
                break;
            case 'LOAD_STUDENT':
                this.setStudent(action.student);
                break;
            default:
                break;
        }
    }
}
const studentStore = new StudentStore();

dispatchers.register(studentStore.handle.bind(studentStore));

export default studentStore;