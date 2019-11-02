class ESGarbageCollect extends EngineStepBase {

    constructor() {
        super();
        this._world = Factory.getWorld();
        this._console = Factory.getConsole();
        this._constants = Factory.getConstants();
    }

    apply(obj) {
        // Kill objects that fall-off stage.
        if (obj.y <= -this._constants.blockSize() * 2) {
            this._console.trace('Object falling off-stage: ' + obj.name());
            obj.traits.addTraitGeneric('kill', 0);
        }

        // Remove objects out with (expired) kill tag.
        if (obj.traits.has('kill')) {
            let trait = obj.traits.get('kill');
            if (trait.ttl == 0) {
                this._console.trace('Object getting removed because `kill` trait out of TTL: ' + obj.name());
                obj.onKillBase();
                this._world.deleteObject(obj);
            } else if (trait.kill < 0) {
                throw new Error("Invalid ttl: " + trait.ttl);
            }
        }
    }
}
