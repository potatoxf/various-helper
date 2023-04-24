import {InstanceCreator} from "./init";
import {useCookies} from '@vueuse/integrations/useCookies';

class CookiesInstanceCreator extends InstanceCreator {

    constructor() {
        super('Cookies');
    }

    createInstance(app) {
        return useCookies();
    }

    get(key, option) {
        return this.getInstance().get(key, option);
    }

    set(key, value, option) {
        this.getInstance().set(key, value, option);
    }

    del(key, option) {
        this.getInstance().remove(key, option);
    }
}

export default new CookiesInstanceCreator();
