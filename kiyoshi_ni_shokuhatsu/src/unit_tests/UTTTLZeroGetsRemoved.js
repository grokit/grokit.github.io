class UTTTLZeroGetsRemoved extends UnitTestsBase {
    constructor() {
        super();
        this._world = Factory.getWorld();
    }

    setup() {
        this._world.clearAll();
        this._fireball = new OBFireball(400, 400);
        this._fireball.traits.addTraitGeneric('kill', 0);
        this._world.addObject(this._fireball);
    }

    tick() {
        let engineTime = this._engine.getTime();
        if (engineTime > 0) {
            if (this._world.TEST_ONLY_isInWorld(this._fireball)) {
                throw new Error("Expect fire not in world.");
            } else {
                this._isDone = true;
            }
        }
    }
}