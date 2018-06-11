class Input {
    // From: https://github.com/kittykatattack/learningPixi#introduction
    static keyboard(keyCode) {
        var key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;

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
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );

        return key;
    }

    static wireEngine(engine) {
        var keys = [];
        keys.push(Input.keyboard(37)); // left
        keys.push(Input.keyboard(38)); // up
        keys.push(Input.keyboard(39)); // right 
        keys.push(Input.keyboard(40)); // down
        keys.push(Input.keyboard(74)); // j

        for (let key of keys) {
            key.press = function() {
                engine.onKeyPress(key.code);
            }
            key.release = function() {
                engine.onKeyRelease(key.code);
            }
        }
    }
}