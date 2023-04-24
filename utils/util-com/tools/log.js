export const LogLevel = Object.freeze({
    trace: 1,
    debug: 2,
    log: 3,
    info: 4,
    error: 5,
    close: 6,
});

let globalLogLevel = LogLevel.close;

const getLogLevel = (level, defaultLevel = LogLevel.close) => {
    if (level) {
        return level.valueOf();
    } else {
        return defaultLevel.valueOf();
    }
};

const isEnableLog = (level, targetLevel) => {
    return getLogLevel(level) <= getLogLevel(targetLevel);
}

export const getGlobalLogLevel = () => {
    return globalLogLevel;
};

export const setGlobalLogLevel = (level) => {
    const logLevel = getLogLevel(level);
    if (logLevel) {
        globalLogLevel = logLevel;
    }
};

export const trace = (...args) => {
    if (isEnableLog(globalLogLevel, LogLevel.trace)) {
        console.trace(...args);
    }
}

export const debug = (...args) => {
    if (isEnableLog(globalLogLevel, LogLevel.debug)) {
        console.debug(...args);
    }
}

export const log = (...args) => {
    if (isEnableLog(globalLogLevel, LogLevel.log)) {
        console.log(...args);
    }
}

export const info = (...args) => {
    if (isEnableLog(globalLogLevel, LogLevel.info)) {
        console.info(...args);
    }
}

export const error = (...args) => {
    if (isEnableLog(globalLogLevel, LogLevel.error)) {
        console.error(...args);
    }
}
