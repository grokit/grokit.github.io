class GameAudio {
    constructor() {
        this._device = null;
    }

    setGameAudioDevice(audioDevice) {
        this._device = audioDevice;
    }

    play(sound) {
        let audio = new Audio("audio/sfx/jump.ogg");
        audio.play();
        //audio = new Audio("audio/sfx/jump_long.ogg");
        //audio.play();
    }

    stopAll() {
        // Does not work.
        if (0) {
            this._device.pause();
            this._device.currentTime = 0;
            this._device.play();
        }
    }
}