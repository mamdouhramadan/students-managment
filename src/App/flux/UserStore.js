import dispatchers from "./dispatchers";
import { EventEmitter } from "events";

class UserStore extends EventEmitter {
    currentRole = '';
    permission = [];

    setRoles(role) {
        this.currentRole = role;
        this.emit('change');
    }
    setPermission (permission) {
        this.permission = permission;
        this.emit('change');
    }

    handle(action) {
        switch (action.type) {
            case 'Update_ROLE':
                this.setRoles(action.payload.currentRole);
                break;
            case 'UPDATE_PERMISSION':
                this.setPermission(action.payload.permission);
                break;
            default:
                break;
        }
    }
}
const userStore = new UserStore();

dispatchers.register(userStore.handle.bind(userStore));

export default userStore;