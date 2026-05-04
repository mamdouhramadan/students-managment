import dispatchers from "./dispatchers";
import { EventEmitter } from "events";
import { ActionTypes } from "./actionTypes";
import { getPermissionsForRole } from "../constants";

function readAuthUser() {
    try {
        const raw = localStorage.getItem("authUser");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

class UserStore extends EventEmitter {
    token = localStorage.getItem("token") || null;
    authUser = readAuthUser();
    currentRole = this.authUser?.role || localStorage.getItem("role") || null;
    permission = this.authUser
        ? getPermissionsForRole(this.authUser.role)
        : JSON.parse(localStorage.getItem("permissions") || "[]");
    isAuthenticated = !!(this.token && this.authUser);

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

    loginSuccess({ user, token }) {
        this.authUser = user;
        this.token = token;
        this.currentRole = user.role;
        this.permission = getPermissionsForRole(user.role);
        this.isAuthenticated = true;
        localStorage.setItem("authUser", JSON.stringify(user));
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);
        localStorage.setItem("permissions", JSON.stringify(this.permission));
        this.emit('change');
    }

    mergeAuthUser(user) {
        this.authUser = { ...this.authUser, ...user };
        localStorage.setItem("authUser", JSON.stringify(this.authUser));
        this.emit('change');
    }

    logout() {
        this.authUser = null;
        this.token = null;
        this.currentRole = null;
        this.permission = [];
        this.isAuthenticated = false;
        localStorage.removeItem("authUser");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("permissions");
        this.emit('change');
    }

    handle(action) {
        switch (action.type) {
            case ActionTypes.LOGIN_SUCCESS:
                this.loginSuccess(action.payload);
                break;
            case ActionTypes.UPDATE_AUTH_USER:
                this.mergeAuthUser(action.payload);
                break;
            case ActionTypes.LOGOUT:
                this.logout();
                break;
            case ActionTypes.UPDATE_ROLE:
                this.setRoles(action.payload.currentRole);
                break;
            case ActionTypes.UPDATE_PERMISSION:
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
