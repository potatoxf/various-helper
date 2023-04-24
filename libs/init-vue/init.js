import {trace, validObject} from "@various-helper/util-com";

export class InstanceCreator {
    #name;
    #instance;
    #option;
    #created = false;

    constructor(name) {
        this.#name = name;
    }

    getName() {
        return this.#name;
    }

    getInstance() {
        if (this.#instance) {
            return this.#instance;
        }
        if (this.#created) {
            throw new Error("不支持实例");
        } else {
            throw new Error("未进行初始化");
        }
    }

    getOption() {
        if (this.#option) {
            return this.#option;
        }
        if (this.#created) {
            throw new Error("不支持实例");
        } else {
            throw new Error("未进行初始化");
        }
    }

    /**
     * 初始化Vue组件
     * @param app Vue实例
     * @param option 配置对象
     * @returns app
     */
    initApp(app, option) {
        //创建实例并注册
        if (!this.#created) {
            this.#option = validObject(option, this.#name, {});
            this.initOption(this.#option);

            //加载依赖创建
            const dependOnCreatorList = this.dependOnList();
            if (Array.isArray(dependOnCreatorList) && dependOnCreatorList.length > 0) {
                for (let i = 0; i < dependOnCreatorList.length; i++) {
                    dependOnCreatorList[i].initApp(app, option);
                }
            }
            this.#instance = this.createInstance(app);
            if (this.#instance != null) {
                trace('实例化实例', this.#name);
            }
            this.#created = true;
            //初始化相关内容
            this.init();
        }
        return app;
    }

    dependOnList() {
        return [];
    }

    initOption(option) {

    }

    createInstance(app) {

    }

    init() {
    }
}

export function init(instanceCreator) {
    return {
        name: instanceCreator.getName(),
        initApp: (app, option) => {
            instanceCreator.initApp(app, option);
        }
    };
}
