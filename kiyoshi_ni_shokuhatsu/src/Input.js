class Key {}

class Input {
    // ::: support gamepad?: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
    // From: https://github.com/kittykatattack/learningPixi#introduction
    _createKey(keyCode, action) {
        var key = new Key();
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        key.action = action;

        key.downHandler = function(event) {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        key.upHandler = function(event) {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        //Attach event listeners
        window.addEventListener("keydown", key.downHandler.bind(key), false);
        window.addEventListener("keyup", key.upHandler.bind(key), false);

        return key;
    }

    _onKeyPress(keyObj) {
        for (let k of this._input) {
            if (k.action == keyObj.action) {
                this._input.delete(k);
            }
        }
        this._input.add(keyObj);
    }

    _onKeyRelease(keyObj) {
        for (let k of this._input) {
            if (k.action == keyObj.action) {
                this._input.delete(k);
            }
        }
    }

    constructor() {
        var keys = [];
        // http://www.javascripter.net/faq/keycodes.htm
        // https://keycode.info
        keys.push(this._createKey(37, 'left')); // left arrow
        keys.push(this._createKey(65, 'left')); // a 
        keys.push(this._createKey(38, 'up')); // up arrow
        keys.push(this._createKey(87, 'up')); // w
        keys.push(this._createKey(32, 'jump')); // space
        keys.push(this._createKey(39, 'right')); // right arrow
        keys.push(this._createKey(68, 'right')); // d
        keys.push(this._createKey(40, 'down')); // down arrow
        keys.push(this._createKey(83, 'down')); // s
        keys.push(this._createKey(90, 'jump')); // z
        keys.push(this._createKey(88, 'action')); // x


        let th = this;
        for (let key of keys) {
            key.press = function() {
                th._onKeyPress(key);
            }

            key.release = function() {
                th._onKeyRelease(key);
            }
        }

        this._input = new Set();
    }


    // Expect this to be called externally
    // once a tick.
    getAndOnlyGetKeys() {
        return this._input;
    }
}