class UTFallOffScreenGetsDestroyed extends UnitTestsBase {
    constructor() {
        super();
    }

    setup() {
        this._world.addObject(new OBSurface(100, 0));
        this._hero = new OBHero(0, 100);
        this._world.addObject(this._hero);
    }

    onBeginLoop() {
        let engineTime = this._engine.getTime();

        if (engineTime < 15) {
            if (!this._world.TEST_ONLY_isInWorld(this._hero)) {
                throw new Error("Expect hero in world.");
            }
        } else if (!this._world.TEST_ONLY_isInWorld(this._hero)) {
            this._isDone = true;
        }

        // Let test time-out if hero never vanishes.
    }
}