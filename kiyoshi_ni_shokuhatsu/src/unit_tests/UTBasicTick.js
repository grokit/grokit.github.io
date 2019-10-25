class UTBasicTick extends UnitTestsBase {
    constructor() {
        super();
    }

    setup() {
        this._hero = new OBHero(400, 275);

        this._hTick = 0;
        let th = this;
        this._hero.tick = function() {
            th._hTick += 1;
        }

        this._world.addObject(this._hero);
        this._world.addObject(new OBSurface(400, 0));
    }

    tick() {
        let engineTime = this._engine.getTime();

        // `this` is ticked once right after creating, which is why
        // it's 1 in advance of engine.
        if (engineTime - this._hTick > 1) {
            // :::B make more precise
            let eStr = "|" + engineTime + " / " + this._hTick + "|";
            throw new Error(eStr);
        }

        if (this._hTick > 10) {
            this._isDone = true;
        }
    }
}