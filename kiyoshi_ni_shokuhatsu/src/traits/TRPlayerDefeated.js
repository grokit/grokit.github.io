class TRPlayerDefeated extends TraitBase {
    constructor(ttl = -1) {
        super();
        this.ttl = ttl;
        this._age = 0;
    }

    baseTick() {
        this.tick();
    }

    name() {
        return this.constructor.name;
    }

    // Use to trigger an action after player has been dead
    // for X time.
    getAge() {
        return this._age;
    }

    setAge(age) {
        this._age = age;
    }

    tick() {
        this._age += 1;
    }
}