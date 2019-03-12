let priv_sounds = new Map();
let priv_sound_id = 0;

/**
 * # Links
 * - https://pixijs.io/pixi-sound/examples/demo.html
 * - https://pixijs.io/pixi-sound/docs/PIXI.sound.Sound.html
 */
class Audio {
    static play(name, volume, isLoop) {
        if (!Constants.isAudio()) {
            return;
        }

        if (!Constants.isMusic() && name.search('/music/') != -1) {
            return;
        }

        // https://pixijs.io/pixi-sound/examples/index.html
        let sId = priv_sound_id;
        const handle = PIXI.sound.Sound.from({
            url: name,
            autoPlay: true,
            loop: isLoop,
            volume: volume,
            complete: function() {
                priv_sounds.delete(sId);
                //console.log('total sounds ' + priv_sounds.size);
            }
        });
        priv_sounds.set(priv_sound_id, handle);
        priv_sound_id += 1;
    }

    static stopAll() {
        for (let [k, sound] of priv_sounds.entries()) {
            sound.stop();
        }
        priv_sounds = new Map();
    }

}