// Traits are the main building block of objects.
//
// They define what an object can do, and how it interact with
// other objects.
//
// They can be ephemeral, and do action when they run out of ttl.
//
// Time: -1: forever
//        0+: count-down to 0, when at 0 gets auto-removed.
//        This number is number of engine tick, ~= 1/60s.
class Traits {
    constructor() {
        this._t = new Map();
        this._console = Factory.getConsole();
    }

    has(name) {
        return this._t.has(name);
    }

    get(name) {
        if (!this._t.has(name)) {
            throw "Requesting invalid trait.";
        }

        return this._t.get(name);
    }

    // Most traits are just a tag. In this case, just set
    // the base trait.
    addTraitGeneric(name, ttl = -1) {
        // Another nice JavaScript oddity:
        // https://stackoverflow.com/questions/203739/why-does-instanceof-return-false-for-some-literals
        if (!(typeof name == "string")) {
            throw "Wrong class type.";
        }

        let trait = new TraitBase(ttl);
        // this._console.debug('Add ' + name + ' with ttl: ' + trait.ttl);
        this._t.set(name, trait);
    }

    // To set more complex traits that might carry
    // custom function or behavior.
    addTrait(trait) {
        if (!(trait instanceof TraitBase)) {
            throw "Wrong class type.";
        }

        this._t.set(trait.name(), trait);
    }

    remove(name) {
        this._t.delete(name);
    }

    tick() {
        for (let kvp of this._t) {
            kvp[1].baseTick();

            if (kvp[1].ttl == 0) {
                // It went through engine once with < 0, now just
                // remove that property.  
                // The 'kill' property will wipe entire object,
                // do not remove to make sure it gets triggered.
                if (kvp[0] != 'kill') {
                    this.remove(kvp[0]);
                }
            } else if (kvp[1].ttl > 0) {
                kvp[1].ttl -= 1;
            }
        }
    }
}