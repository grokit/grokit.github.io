class Constants {

    static isBlockAfterXFrames() {
        return false;
    }

    // Global switch for all audio.
    static isAudio() {
        return true;
    }

    static isMusic() {
        return Constants.isAudio() && true;
    }

    static isSlowDown() {
        return false;
    }

    static isMeasureFPS() {
        return false;
    }
}
