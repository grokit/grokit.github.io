class UTBasicTick extends UnitTestsBase {
    constructor() {
        super();
    }

    setup() {
        this._hero = new OBHero(100, this._constants.blockSize());

        this._hTick = 0;
        let th = this;
        this._hero.tick = function() {
            th._hTick += 1;
        }

        this._world.addObject(this._hero);
        this._world.addObject(new OBSurface(100, 0));
    }

    onBeginLoop() {
        let engineTime = this._engine.getTime();

        if (engineTime - this._hTick > 0) {
            let eStr = "|" + engineTime + " / " + this._hTick + "|";
            throw new Error(eStr);
        }

        if (this._hTick > 10) {
            this._isDone = true;
        }
    }
}