class UTObjTTLExpireGetsRemoved extends UnitTestsBase {
    constructor() {
        super();
    }

    setup() {
        this._fireball = new OBFireball(100, 100);

        // This is what we are testing.
        this._fireball.traits.addTraitGeneric('kill', 20);

        this._world.addObject(this._fireball);

        // Need another object with no TTL, or else the test will
        // stop apply() call since there is no object in the world.
        this._world.addObject(new OBText(this.name(), 200, 200));
    }

    onBeginLoop() {
        let engineTime = this._engine.getTime();
        if (engineTime < 15) {
            if (!this._world.TEST_ONLY_isInWorld(this._fireball)) {
                throw new Error("Expect fire in world.");
            }
        } else if (!this._world.TEST_ONLY_isInWorld(this._fireball)) {
            this._isDone = true;
        }
    }
}