// Traits are the main building block of objects.
//
// They define what an object can do, and how it interact with
// other objects.
//
// They can be ephemeral, and do action when they run out of time.
class Traits {
    constructor() {
        this._t = new Map();
    }

    has(name) {
        return this._t.has(name);
    }

    get(name) {
        return this._t.get(name);
    }

    add(name, time = -1) {
        // ::: just use set with -1 as default
        if (time != -1) {
            throw "Add is not meant to set a time. Did you mean set(...)?";
        }

        this.set(name, -1);
    }

    set(name, time = -1) {
        this._t.set(name, time);
    }

    remove(name) {
        this._t.delete(name);
    }

    tick() {
        for (let kvp of this._t) {
            if (kvp[1] == 0) {

                // Special property, when reach 0 signal to engine time
                // to remove this object.
                if (kvp[0] == 'kill') {
                    this._t.set('engine_rm', -1);
                }

                // It went through engine once with < 0, now just
                // remove that property.  
                this.remove(kvp[0]);
            } else {
                if (kvp[0] == 'on_surface') {
                    //Console.log('Subtract trait: ' + kvp[0]);
                }

                if (kvp[1] > 0) {
                    this.set(kvp[0], kvp[1] - 1);
                }
            }
        }
    }
}