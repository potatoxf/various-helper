import {InstanceCreator} from './init';
import * as ElementPlusIcons from '@element-plus/icons-vue'

class ElementPlusIconsInstance extends InstanceCreator {

    constructor() {
        super('ElementPlusIcons');
    }

    createInstance(app) {
        for (const key in ElementPlusIcons) {
            const component = ElementPlusIcons[key];
            app.component(key, component);
            const nk = 'ei' + key.toString().replace(/([A-Z])/g, "-$1").toLowerCase();
            app.component(nk, component);
        }
    }
}

export default new ElementPlusIconsInstance();
