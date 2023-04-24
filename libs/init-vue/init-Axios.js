import {InstanceCreator} from './init';
import cookiesInstance from './init-Cookies';
import {
    callFunction,
    callPromise,
    toBoolean,
    validFunction,
    validObject,
    validString
} from "@various-helper/util-com";
import Axios from "axios";
import VueAxios from "vue-axios";

class AxiosInstanceCreator extends InstanceCreator {
    #isNotifySuccess = false;
    #onfulfilled = undefined;
    #onrejected = undefined;

    constructor() {
        super('Axios');
    }

    handleArgument(arg) {
        if (typeof arg === 'object') {
            this.#isNotifySuccess = toBoolean(arg, 'isNotifySuccess', false);
            this.#onfulfilled = validFunction(arg, 'onfulfilled');
            this.#onrejected = validFunction(arg, 'onrejected');
        }
    }

    dependOnList() {
        return [cookiesInstance];
    }

    initOption(option) {
        option.instance = validObject(option, 'instance', {});
        option.messageField = validString(option, 'messageField', 'message');
        option.tokenKey = validString(option, 'tokenKey', 'token');
        option.checkSuccess = typeof option?.checkSuccess === 'function' ? option?.checkSuccess : (() => true);
        option.handleSuccessMessage = typeof option?.handleSuccessMessage === 'function' ? option?.handleSuccessMessage : undefined;
    }

    createInstance(app) {
        const option = this.getOption();
        const axiosInstance = Axios.create(option.instance);
        app.use(VueAxios, axiosInstance);
        return axiosInstance
    }

    init() {
        const axiosInstance = this.getInstance();
        axiosInstance.interceptors.request.clear();
        axiosInstance.interceptors.response.clear();

        const option = this.getOption();

        axiosInstance.interceptors
            .request.use(function (config) {

            const token = cookiesInstance.get(option.tokenKey);
            if (token) {
                config.headers[option.tokenKey] = token;
            }

            return config;
        }, function (error) {
            return Promise.reject(error);
        });

        axiosInstance.interceptors
            .response.use((response) => {
            const responseData = response.data;
            if (this.#isNotifySuccess && typeof option.messageField === 'string') {
                const message = responseData[option.messageField];
                if (!(option.checkSuccess) || option.checkSuccess(responseData)) {
                    if (typeof message === 'string') {
                        callFunction(option.prompt, 'success', option.handleSuccessMessage ? option.handleSuccessMessage(message) : message)
                    }
                } else {
                    if (typeof message === 'string') {
                        callFunction(option.prompt, 'error', message);
                        return Promise.reject(responseData);
                    }
                }
            }
            return responseData;
        }, (error) => {
            const responseData = error.response.data;
            if (typeof option.messageField === 'string') {
                const message = responseData[option.messageField];
                if (typeof message === 'string') {
                    callFunction(option.prompt, 'error', message);
                }
            }
            return Promise.reject(responseData);
        });
    }

    request(config, option) {
        this.handleArgument(option);
        let promise = this.getInstance().request(config);
        return callPromise(promise, this.#onfulfilled, this.#onrejected);
    }

    get(url, config, option) {
        this.handleArgument(option);
        const promise = this.getInstance().get(url, config);
        return callPromise(promise, this.#onfulfilled, this.#onrejected);
    }

    delete(url, config, option) {
        this.handleArgument(option);
        const promise = this.getInstance().delete(url, config);
        return callPromise(promise, this.#onfulfilled, this.#onrejected);
    }

    head(url, config, option) {
        this.handleArgument(option);
        const promise = this.getInstance().head(url, config);
        return callPromise(promise, this.#onfulfilled, this.#onrejected);
    }

    options(url, config, option) {
        this.handleArgument(option);
        const promise = this.getInstance().options(url, config);
        return callPromise(promise, this.#onfulfilled, this.#onrejected);
    }

    post(url, data, config, option) {
        this.handleArgument(option);
        const promise = this.getInstance().post(url, data, config);
        return callPromise(promise, this.#onfulfilled, this.#onrejected);
    }

    put(url, data, config, option) {
        this.handleArgument(option);
        const promise = this.getInstance().put(url, data, config);
        return callPromise(promise, this.#onfulfilled, this.#onrejected);
    }

    patch(url, data, config, option) {
        this.handleArgument(option);
        const promise = this.getInstance().patch(url, data, config);
        return callPromise(promise, this.#onfulfilled, this.#onrejected);
    }

    postForm(url, data, config, option) {
        this.handleArgument(option);
        const promise = this.getInstance().postForm(url, data, config);
        return callPromise(promise, this.#onfulfilled, this.#onrejected);
    }

    putForm(url, data, config, option) {
        this.handleArgument(option);
        const promise = this.getInstance().putForm(url, data, config);
        return callPromise(promise, this.#onfulfilled, this.#onrejected);
    }

    patchForm(url, data, config, option) {
        this.handleArgument(option);
        const promise = this.getInstance().patchForm(url, data, config);
        return callPromise(promise, this.#onfulfilled, this.#onrejected);
    }
}

export default new AxiosInstanceCreator();
