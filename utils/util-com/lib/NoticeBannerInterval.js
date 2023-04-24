import {toBoolean, toFloat, validArray} from "../tools/lang";

/**
 * 通知横幅间隔器
 */
export class NoticeBannerInterval {
    #hook;
    #data = [];
    #rtl = true;
    #width = 1000;
    #interval = 30;
    #speed = 2;

    #current = 0;
    #location = 0;
    #timer = null;

    constructor(option) {
        if (option) {
            if (typeof option.hook === 'function') {
                this.#hook = option.hook;
            }
            this.#data = validArray(option, 'data', []);
            this.#rtl = toBoolean(option, 'rtl', true);
            this.#width = toFloat(option, 'width', this.#width);
            this.#interval = toFloat(option, 'interval', this.#interval);
            this.#speed = toFloat(option, 'speed', this.#speed);
        }
    }

    isNoEmpty() {
        return this.#data.length > 0;
    }

    isCurrentEfficient() {
        return this.#current >= 0 && this.#current < this.#data.length;
    }

    getCurrentIndex() {
        return this.isCurrentEfficient() ? this.#current : -1;
    }

    getCurrentData() {
        return this.isCurrentEfficient() ? this.#data[this.#current] : null;
    }

    pause() {
        if (this.#timer) {
            clearInterval(this.#timer);
        }
    }

    run(contentWidth) {
        this.#timer = setInterval(() => {
            this.#scroll(contentWidth);
        }, this.#interval);
    }

    #scroll(contentWidth) {
        if (!this.isNoEmpty()) {
            return;
        }
        const value = toFloat(contentWidth, null, 0);
        let start = 0;
        let end = 0;
        if (value) {
            if (this.#rtl) {
                start = value;
                end = -value - this.#width;
            } else {
                start = -value;
                end = value + this.#width;
            }
        }

        if (this.isCurrentEfficient()) {
            if (this.#rtl) {
                this.#location -= this.#speed;
                if (this.#location <= end) {
                    this.#current += 1;
                    this.#location = start;
                }
            } else {
                this.#location += this.#speed;
                if (this.#location >= end) {
                    this.#current += 1;
                    this.#location = start;
                }
            }
        } else {
            this.#current = 0;
            this.#location = start;
        }

        if (typeof this.#hook === 'function') {
            this.#hook(this.#location);
        }
    }
}
