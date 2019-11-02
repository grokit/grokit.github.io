class UnitTests {
    constructor() {
        this._tests = [];

// REFLECTION: Unit-Test list BEGIN.
this._tests.push(new UTPlayerDefeatedFallingSpike());
this._tests.push(new UTObjTTLExpireGetsRemoved());
this._tests.push(new UTBasicTick());
this._tests.push(new UTFallOffScreenGetsDestroyed());
this._tests.push(new UTTTLZeroGetsRemoved());
this._tests.push(new UTMeasureFPSWithBalls());
this._tests.push(new UTTools());
// REFLECTION: Unit-Test list END.
    }

    getAll() {
        return this._tests;
    }
}