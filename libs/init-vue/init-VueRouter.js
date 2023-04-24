import {InstanceCreator} from './init';
import axiosInstance from './init-Axios'
import cookiesInstance from './init-Cookies';
import {
    buildObjectTree,
    findObjectTreeList,
    validArray,
    validString,
    validValue,
    toBoolean,
    toStr, trace,
} from "@various-helper/util-com";

import {
    createRouter,
    createWebHashHistory,
    createWebHistory,
} from 'vue-router';

function parseComponent(component, replace) {
    if (typeof component === 'string') {
        component = component
            .replace(/\\+/g, '/')
            .replace(/\/+/g, '/');
        if (replace && replace.source) {
            component = component.replace(replace.source, replace.target || '');
        }
        if (component.slice(component.length - 4).toLowerCase() !== '.vue') {
            component = component + '.vue';
        }
        return '/' + component.replace(/^\//g, '');
    }
}

function parsePath(path) {
    if (typeof path === 'string') {
        return '/' + path
            .replace(/\\+/g, '/')
            .replace(/\/+/g, '/')
            .replace(/^\//g, '');
    }
}

function parseName(name) {
    if (typeof name === 'string') {
        return name
            .replace(/[^a-zA-Z0-9]/g, '_');
    }
}

function parseRedirect(redirect) {
    if (typeof redirect == 'string') {
        return '/' + redirect
            .replace(/\\+/g, '/')
            .replace(/\/+/g, '/')
            .replace(/^\//g, '');
    }
}

/**
 *
 const menuData = {
    path: null,
    name: null,
    redirect: null,
    component: null,
    strict: null,
    title: null,
    icon: null,
    url: null,
    children: [],
    noRequireLoginAuth: false,
}
 * 解析路由
 * @param menuData
 * @param option
 * @returns {{}|null}
 */
function resolveRoute(menuData, option) {
    const route = {};

    // 解析path
    const path = parsePath(menuData.path);
    if (typeof path === 'string') {
        menuData.path = route.path = path;
    } else {
        return null;
    }

    // 解析component
    const component = parseComponent(menuData.component, option.replace);
    if (typeof component === 'string') {
        menuData.component = component;
        route.component = () => import(component);
    } else {
        return null;
    }

    // 解析name
    const name = parseName(menuData.name);
    if (typeof name === 'string') {
        menuData.name = route.name = name;
    }

    // 解析redirect
    const redirect = parseRedirect(menuData.redirect);
    if (typeof redirect === 'string') {
        menuData.redirect = route.redirect = redirect;
    }

    // 解析redirect
    const strict = toBoolean(menuData, 'strict', null);
    if (strict != null) {
        menuData.strict = route.strict = strict;
    }

    const meta = {}
    route.meta = meta;
    menuData.title = meta['title'] = validString(menuData, 'title', null);
    menuData.icon = meta['icon'] = validString(menuData, 'icon', null);
    menuData.url = meta['url'] = validString(menuData, 'url', null);
    menuData.noRequireLoginAuth = meta['noRequireLoginAuth'] = toBoolean(menuData, 'noRequireLoginAuth', true);

    const extraFields = validArray(option, 'extraFields');
    for (const extrafield of extraFields) {
        if (menuData[extrafield]) {
            meta[extrafield] = menuData[extrafield];
        }
    }
    return route;
}

/**
 * 解析路由列表
 * @param menuDataList 菜单数据列表
 * @param container 孩子节点容器
 * @param option 选项配置
 * @returns {[]}
 */
function resolveRouteList(menuDataList, container, option) {
    if (!Array.isArray(menuDataList) || menuDataList.length <= 0) {
        return container;
    }
    for (const i in menuDataList) {
        const route = resolveRoute(menuDataList[i], option);
        if (route) {
            const oldLen = container.length;
            resolveRouteList(menuDataList[i].children, container, option);
            if (oldLen === container.length) {
                container.push(route);
            }
        }
    }
    return container;
}

/**
 * 创建路由数组
 * @param menuRouters 菜单路由
 * @param option 选项配置
 * @returns {*[]}
 */
function resolveRoutesFromMenuList(menuRouters, option) {
    const routes = [];
    if (menuRouters) {
        const menuRouteList = Array.isArray(menuRouters) ? menuRouters : [menuRouters];
        for (const i in menuRouteList) {
            if (menuRouteList[i]) {
                const route = resolveRoute(menuRouteList[i], option);
                if (route) {
                    routes.push(route);
                    const children = resolveRouteList(menuRouteList[i].children, [], option);
                    if (children.length > 0) {
                        route.children = children;
                    }
                }
            }
        }
    }
    return routes;
}

class VueRouterInstanceCreator extends InstanceCreator {
    constructor() {
        super('VueRouter');
    }

    #originalData = null;


    dependOnList() {
        return [cookiesInstance, axiosInstance];
    }

    initOption(option) {

        option.useHash = toBoolean(option, 'useHash', true);
        option.routeUrl = toStr(option, 'routeUrl', null);

        option.routes = validArray(option, 'routes', []);
        option.extraFields = validArray(option, 'extraFields', []);

        option.dataField = validString(option, 'dataField', null);

        const source = validValue(option.replace, 'source', null);
        const target = validString(option.replace, 'target', '');
        if (source) {
            option.replace = {
                source, target
            };
        }

        option.tokenKey = validString(option, 'tokenKey', 'token');
        option.mainRoute = validValue(option, 'mainRoute', {});
        option.mainRoute.login = validValue(option.mainRoute, 'login', {});
        option.mainRoute.home = validValue(option.mainRoute, 'home', {});
    }

    createInstance(app) {
        const option = this.getOption();
        const history = option.useHash ? createWebHashHistory() : createWebHistory();
        const routes = [];
        if (option.routes.length > 0) {
            routes.push(...option.routes);
        }
        if (option.mainRoute) {
            for (const routeField in option.mainRoute) {
                const route = validValue(option.mainRoute, routeField);
                if (route) {
                    if (typeof route.component === 'string') {
                        route.component = parseComponent(route.component, option.replace);
                        if (route.component) {
                            route.component = import(route.component);
                        }
                    }
                    routes.push(route);
                }
            }
        }

        const vueRouter = createRouter({
            history: history,
            routes: routes
        });

        vueRouter.beforeEach((to, from, next) => {
            let isNext = false;
            if (to.matched.some(record => toBoolean(record.meta, 'noRequireLoginAuth', true))) {
                if (typeof option.tokenKey === 'string') {
                    const token = cookiesInstance.get(option.tokenKey);
                    //如果没有登录
                    if (token == null) {
                        isNext = true;
                        next({path: option.mainRoute.login.path});
                    } else {
                        if (to.path === option.mainRoute.login.path) {
                            isNext = true;
                            next({path: option.mainRoute.home.path});
                        } else {
                            isNext = true;
                            next();
                        }
                    }
                }

            }

            if (!isNext) {
                next();
            }
        });
        app.use(vueRouter);
        return vueRouter;
    }


    init() {
        const option = this.getOption();
        if (option.routeUrl) {
            trace('获取路由信息URL：', option.routeUrl);
            axiosInstance.get(option.routeUrl)
                .then((res) => {
                    if (option.dataField && res.hasOwnProperty(option.dataField)) {
                        this.#originalData = res[option.dataField];
                    } else {
                        this.#originalData = res;
                    }
                    this.setOriginalData(this.#originalData);
                });
        }
    }

    clearOriginalData() {
        this.#originalData = [];
    }

    setOriginalData(data) {
        if (data) {
            this.#originalData = data;
            const option = this.getOption();
            const instance = this.getInstance();
            resolveRoutesFromMenuList(data, option).forEach((v) => {
                instance.addRoute(v);
            });
            buildObjectTree(this.#originalData);
        }
    }

    getOriginalData() {
        return this.#originalData;
    }

    getCurrentPathLocation(rootIndex, content, contentField = 'path') {
        if (Array.isArray(this.#originalData) && rootIndex >= 0 && rootIndex < this.#originalData.length) {
            return findObjectTreeList(this.#originalData[rootIndex], content, contentField);
        }
    }
}

export default new VueRouterInstanceCreator();
