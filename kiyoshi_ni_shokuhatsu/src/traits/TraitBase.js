class TraitBase {
    constructor(ttl = -1) {
        this.ttl = ttl;
    }

    baseTick() {
        this.tick();
    }

    name() {
        return this.constructor.name;
    }

    // Only called in child.
    //
    // Do not throw exception as TraitBase is
    // not virtual pure.
    tick() {}
}