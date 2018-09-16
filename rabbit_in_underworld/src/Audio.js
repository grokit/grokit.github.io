class Audio {
    static play(name, volume, isLoop) {
        // https://pixijs.io/pixi-sound/docs/PIXI.sound.Sound.html
        PIXI.sound.Sound.from({
            url: name,
            autoPlay: true,
            loop: isLoop,
            volume: volume,
        });
    }
}