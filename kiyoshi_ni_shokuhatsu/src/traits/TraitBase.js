class TraitBase {
    constructor(ttl = -1) {
        this.ttl = ttl;
    }

    name() {
        return this.constructor.name;
    }

    baseTick() {
        this.tick();
    }

    // Only called in child.
    //
    // Do not throw exception as TraitBase is
    // not virtual pure.
    tick() {}
}