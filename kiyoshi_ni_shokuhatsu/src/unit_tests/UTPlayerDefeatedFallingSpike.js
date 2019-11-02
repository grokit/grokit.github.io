//
// A spike falls on our dear hero.
//
// Expectations:
//
// - Spike has hero below, starts falling.
//
// - Hero gets the TRPlayerDefeated trait.
//   - That property increases in age as time++.
//
// - Spike sticks on ground.
//
class UTPlayerDefeatedFallingSpike extends UnitTestsBase {
    constructor() {
        super();
    }

    setup() {
        this._world.addObject(new OBSurface(100, 0));
        this._hero = new OBHero(100, this._constants.blockSize());
        this._world.addObject(this._hero);

        this._spike = new OBSpikeCeilingFalling(100, this._constants.blockSize() * 4)
        this._world.addObject(this._spike);

        this._lastAge = 0;
    }

    onBeginLoop() {
        let engineTime = this._engine.getTime();

        if (engineTime > 1 && engineTime < 10) {
            Utils.assert(this._spike.vy < 0);
        }

        if (engineTime > 35) {
            Utils.assert(this._hero.traits.has('TRPlayerDefeated'));
            Utils.assert(this._hero.traits.get('TRPlayerDefeated').getAge() > 2);

            Utils.assert(this._hero.traits.get('TRPlayerDefeated').getAge() > this._lastAge);
            this._lastAge = this._hero.traits.get('TRPlayerDefeated').getAge();

            // Assume spike sticked in ground.
            Utils.assert(this._spike.vy == 0);
        }

        if (engineTime == 100) {
            this._isDone = true;
        }
    }

    onEndLoop() {
        let engineTime = this._engine.getTime();
        if (engineTime > 35) {
            Utils.assert(this._spike.vy == 0);
        }
    }
}