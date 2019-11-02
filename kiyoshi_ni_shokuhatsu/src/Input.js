class Key {
    constructor() {
        // Since the key objects are re-used, consumer
        // can use serial to distinguish different 
        // presses.
        this.serial = 0;

        this.code = -1;
        this.isDown = false;
        this.isUp = true;
        this.press = undefined;
        this.release = undefined;
        this.action = 'None';
    }
}

class Input {

    constructor() {
        this._console = Factory.getConsole();
        this._constants = Factory.getConstants();

        this._initGamepadCallbacks();

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
                key.serial += 1;
                th._onKeyPress(key);
            }

            key.release = function() {
                key.serial += 1;
                th._onKeyRelease(key);
            }
        }

        this._input = new Set();
    }

    // :::BB support gamepad?: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
    // From: https://github.com/kittykatattack/learningPixi#introduction
    _createKey(keyCode, action) {
        let key = new Key();
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
        this._input.add(keyObj);
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
    // https://html5gamepad.com/for-developers
    _initGamepadCallbacks(){
        let th = this;
        window.addEventListener("gamepadconnected", (event) => {
            th._console.info("Gamepad connect: " + JSON.stringify(event.gamepad));
        });

        window.addEventListener("gamepaddisconnected", (event) => {
            th._console.info("Gamepad disconnect: " + JSON.stringify(event.gamepad));
        });
    }

    // PROTOTYPE -- not working yet.
    _gamepadHandleTick(){
        let keys = new Array();

        let gamepads = navigator.getGamepads();
        if(gamepads != null){
            for(let gamepad of gamepads){
                if(gamepad != null){
                    let bid = 0;
                    for(let but of gamepad.buttons){
                        if(but.pressed){
                            let key = new Key();
                            key.action = 'jump';
                            key.isDown = true;
                            key.isUp = false;

                            // Have to reconcile how this works with keyboard keys.
                            // key.serial = Math.random();
                            keys.push(key);
                        }
                        bid += 1;
                    }
                }
            }
        }

        return keys;
    }

    // Expect this to be called externally
    // once a tick.
    getKeysOncePerTick() {
        if(this._constants.gamepadSupport()){
            for(let gkey of this._gamepadHandleTick()){
                this._input.add(gkey);
            }
        }

        return this._input;
    }

    clearKeysUp() {
        //this._input = new Set();
        for (let k of this._input) {
            if (k.isUp) {
                this._input.delete(k);
            }
        }
    }
}
