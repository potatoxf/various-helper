import {init} from "./init";
import {default as ElementPlus} from './init-ElementPlus';
import {default as ElementPlusIcons} from './init-ElementPlusIcons';
import {default as Cookies} from "./init-Cookies";
import {default as Axios} from './init-Axios';
import {default as VueRouter} from "./init-VueRouter";
import {info} from "@various-helper/util-com";

const apps = [
    init(ElementPlus),
    init(ElementPlusIcons),
    init(Cookies),
    init(Axios),
    init(VueRouter)
];

export {
    ElementPlus,
    ElementPlusIcons,
    Cookies,
    Axios,
    VueRouter,
}

// 加载Vue所有组件
export default function initApp(app, option) {
    for (let i = 0; i < apps.length; i++) {
        const ele = apps[i];
        info('安装模块【', ele.name, '】');
        try {
            ele.initApp(app, option);
            info('安装模块【', ele.name, '】--Success !!');
        } catch (e) {
            info('安装模块【', ele.name, '】--Failure !!', e);
        }
    }
    return app;
}
