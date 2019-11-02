class EngineStepBase {

    constructor() {
        this._constants = Factory.getConstants();
    }

    name() {
        return this.constructor.name;
    }

    // Note: this stops being called if there is no object
    // in the world.
    apply(obj) {
        throw new Error("Pure virtual.");
    }

    onBeginLoop() {}
    onEndLoop() {}
}