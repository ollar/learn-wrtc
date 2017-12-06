import AppRouter from './router';

const app = {
    init,
    getMe
};
const me = new Backbone.Model();

export function init() {
    const router = new AppRouter();
    Backbone.history.start();
}

export function getMe() {
    return me;
}

export default app;
