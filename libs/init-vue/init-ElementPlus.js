import {InstanceCreator} from './init';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

class ElementPlusInstanceCreator extends InstanceCreator {

    constructor() {
        super('ElementPlus');
    }

    createInstance(app) {
        app.use(ElementPlus);
        return ElementPlus;
    }

}

export default new ElementPlusInstanceCreator();
