class TRControllable extends TraitBase {

    constructor(ttl = -1) {
        super(ttl);
        this._audio = Factory.getGameAudio();
    }

    name() {
        return 'controllable';
    }

    onKey(key, obj) {
        if (key.action == 'left') {
            obj.vx -= 0.2;
            obj.flippedHorizontally = true;
        } else if (key.action == 'right') {
            obj.vx += 0.2;
            obj.flippedHorizontally = false;
        } else if (key.action == 'up' || key.action == 'jump') {
            this._audio.play(':::');

            if (!obj.traits.has('jumping')) {
                obj.traits.addTraitGeneric('jumping', -1);
                obj.vy += 3.5;
            }
        }
    }
}
