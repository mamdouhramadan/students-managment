import dispatchers from "./dispatchers";
import { EventEmitter } from "events";

class UserStore extends EventEmitter {
    currentRole = localStorage.getItem("role") || null;
    permission = JSON.parse(localStorage.getItem("permissions")) || [];

    setRoles(role) {
        this.currentRole = role;
        localStorage.setItem("role", role);
        this.emit('change');
    }
    setPermission(permission) {
        this.permission = permission;
        localStorage.setItem("permissions", JSON.stringify(permission));
        this.emit('change');
    }

    handle(action) {
        switch (action.type) {
            case 'UPDATE_ROLE':
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