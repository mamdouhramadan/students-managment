class Dispatcher {
    handler = [];


    register(handler) {
        this.handler.push(handler);
    }

    dispatch(action) {
        this.handler.forEach(handler => handler(action));
    }


}

export default new Dispatcher();