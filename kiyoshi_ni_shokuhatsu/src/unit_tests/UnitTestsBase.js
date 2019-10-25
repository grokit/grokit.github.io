//
// Base class for all unit-tests.
//
// Convention: on issue, throw exception.
//
class UnitTestsBase {
    constructor() {
        this._isDone = false;
        this._console = Factory.getConsole();
        this._world = Factory.getWorld();
        this._engine = Factory.getEngine();
        this._constants = Factory.getConstants();
    }

    name() {
        return this.constructor.name;
    }

    baseSetup() {
        this._console.info('Unit-test setup ' + this.name());

        // Stuff expected to be reset for every test.
        this._engine.resetTime();
        this._world.clearAll();

        this.setup();
    }

    setup() {
        throw new Error("Must be overridden.");
    }

    // After this amount of time, if test is not successful
    // it's considered stuck.
    // ::->: put in test base?
    getMaxTimeLength() {
        return 60 * 60;
    }

    baseOnBeginLoop() {
        if (this._engine.getTime() > this.getMaxTimeLength()) {
            throw new Error("Unit-test stuck.");
        }
        this.onBeginLoop();
    }

    onBeginLoop() {}

    baseTick() {

        this.tick();
    }

    tick() {
        throw new Error("Must be overridden.");
    }


    baseOnEndLoop() {
        this.onEndLoop();
    }

    onEndLoop() {}

    isDone() {
        return this._isDone;
    }
}