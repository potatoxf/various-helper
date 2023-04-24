export const v_func_empty = () => {
};

/**
 * 是否是值对象
 */
export function isValueType(object) {
    return object === undefined
        || object === null
        || typeof object === 'number'
        || typeof object === 'string'
        || typeof object === 'boolean'
        || typeof object === 'function'
        || typeof object === 'undefined';
}

/**
 * 判断是否是搜寻表达式
 */
export function isExpressionType(input) {
    return typeof input === 'string' || input instanceof RegExp;
}

export function choiceEffectiveValue(main, second, requireType = 'object', defaultValue = null) {
    if (requireType === 'array') {
        if (Array.isArray(main)) {
            return main;
        } else if (main) {
            return [main]
        }
        if (Array.isArray(second)) {
            return second;
        } else if (second) {
            return [second]
        }
    } else {
        if (typeof main === requireType) {
            return main;
        }
        if (typeof second === requireType) {
            return second;
        }
    }
    return defaultValue;
}

export function validValue(input, field, defaultValue = null) {
    if (typeof field === 'string') {
        if (typeof input === 'object') {
            return input.hasOwnProperty(field) ? input[field] : defaultValue;
        } else {
            return defaultValue;
        }
    } else {
        if (typeof input === 'function') {
            return input();
        } else if (input) {
            return input;
        } else {
            return defaultValue;
        }
    }
}

export function validObject(input, field, defaultValue = {}) {
    return choiceEffectiveValue(validValue(input, field), defaultValue, 'object', {});
}

export function validFunction(input, field, defaultValue = null) {
    return choiceEffectiveValue(validValue(input, field), defaultValue, 'function', null);
}

export function validString(input, field, defaultValue = '') {
    return choiceEffectiveValue(validValue(input, field), defaultValue, 'string', '');
}

export function validArray(input, field, defaultValue = []) {
    return choiceEffectiveValue(validValue(input, field), defaultValue, 'array', []);
}

/**
 * 转换成Boolean值
 */
export function toBoolean(input,
                          field,
                          defaultValue = null) {
    const value = validValue(input, field);
    if (typeof value == 'boolean') {
        return value;
    } else if (typeof value == 'string') {
        return value.toLowerCase() === 'true';
    } else if (typeof value == 'number') {
        return value !== 0;
    }
    return !!defaultValue;
}

/**
 * 转换成字符串
 */
export function toStr(input,
                      field = null,
                      defaultValue = null) {
    const value = validValue(input, field);
    if (typeof value == 'boolean') {
        return value.toString();
    } else if (typeof value === 'number') {
        return value.toString();
    } else if (typeof value === 'string') {
        return value;
    }
    return defaultValue;
}

/**
 * 转换成浮点数
 */
export function toFloat(input,
                        field = null,
                        defaultValue = null) {
    const value = validValue(input, field);
    if (typeof value === 'number') {
        return parseFloat(value.toString());
    } else if (typeof value === 'string') {
        return parseFloat(value);
    }
    return defaultValue;
}

/**
 * 转换成整数
 */
export function toInt(input,
                      field = null,
                      defaultValue = null) {
    const value = validValue(input, field);
    if (typeof value === 'number') {
        return parseInt(value.toString());
    } else if (typeof value === 'string') {
        return parseInt(value);
    }
    return defaultValue;
}

export function callFunction(input, funcField, ...args) {
    if (typeof funcField === 'string') {
        if (typeof input === 'object'
            && input.hasOwnProperty(funcField)
            && typeof input[funcField] === 'function') {
            return input[funcField](...args);
        }
    } else if (typeof input === 'function') {
        return input(...args);
    }
    throw new Error(`Error to call function from object ${input} with ${funcField} field`);
}

export function callPromise(promise, onfulfilled = null, onrejected = null) {
    if (typeof onfulfilled === 'function') {
        return promise.then(onfulfilled, typeof onrejected === 'function' ? onrejected : () => {
        });
    } else {
        return promise;
    }
}

export function copySpecifyAttribute(names = [], from = {}, to = {}) {
    for (const name of names) {
        if (from.hasOwnProperty(name)) {
            const fromData = from[name]
            if (fromData) {
                if (isValueType(fromData)) {
                    to[name] = fromData;
                } else if (Array.isArray(fromData)) {
                    if (Array.isArray(to[name])) {
                        let arr = [];
                        arr.push(...to[name]);
                        arr.push(...fromData);
                        to[name] = arr;
                    } else if (isValueType(to[name])) {
                        let arr = [];
                        arr.push(to[name])
                        arr.push(...fromData);
                        to[name] = arr;
                    } else {
                        let arr = [];
                        arr.push(...fromData);
                        to[name] = arr;
                    }
                } else if (typeof fromData == 'object') {
                    if (isValueType(to[name])) {
                        to[name] = copySpecifyAttribute(Object.keys(fromData), fromData, {});
                    } else {
                        to[name] = copySpecifyAttribute(Object.keys(to[name]), to[name], {});
                        to[name] = copySpecifyAttribute(Object.keys(fromData), fromData, to[name]);
                    }
                } else {
                    // no support
                }
            }
        }
    }
    return to;
}

export function buildObjectTree(input, childrenField = 'children', parentField = 'parent', parent = null) {
    const array = [];
    if (Array.isArray(input)) {
        for (const ele of input) {
            array.push(ele);
        }
    } else if (typeof input === 'object') {
        array.push(input);
    }

    if (array.length > 0) {
        for (const element of array) {
            if (typeof element !== 'object') {
                continue;
            }
            if (typeof parent === 'object') {
                element[parentField] = parent;
            }

            if (element
                && element.hasOwnProperty(childrenField)
                && Array.isArray(element[childrenField])) {
                buildObjectTree(element[childrenField], childrenField, parentField, element);
            }
        }
    }

}

export function findObjectTreeList(input, content, contentField, childrenField = 'children', parentField = 'parent') {
    let node = findObjectTree(input, content, contentField, childrenField);
    let result = [];
    if (node) {
        while (node) {
            result.push(node);
            node = validValue(node, parentField);
        }
        result = result.reverse();
    }
    return result;
}

export function findObjectTree(input, content, contentField, childrenField = 'children') {
    if (input) {
        const array = Array.isArray(input) ? input : [input];
        for (const element of array) {
            const value = validValue(element, contentField);
            if (value === content) {
                return element;
            } else {
                const children = validValue(element, childrenField);
                const result = findObjectTree(children, content, contentField, childrenField);
                if (result) {
                    return result;
                }
            }
        }
    }
    return null;
}
