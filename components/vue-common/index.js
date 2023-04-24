import VhIframe from './lib/vh-iframe/index.vue';

import {App} from "vue";

const components = {VhIframe};
export {
    VhIframe
}

export default {
    install(app) {
        for (let name in components) {
            app.component(name, VhIframe);
        }
    }
}
