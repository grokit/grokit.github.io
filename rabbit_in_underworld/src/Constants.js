class Constants {

    static blockSize() {
        return 32;
    }

    static isDebug() {
        return false;
    }

    static isSlowDown() {
        return false;
    }

    static isBlockAfterXFrames() {
        return false;
    }

    // Global switch for all audio.
    static isAudio() {
        return !Constants.isDebug();
    }

    static isMusic() {
        return Constants.isAudio();
    }

    static isMeasureFPS() {
        return false;
    }
}
