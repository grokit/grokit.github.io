class TraitsLibrary {
    static _displayable(o, gfxPath) {
        o.image = gfxPath;
        o.traits.add('displayable');
        o.traits.add('collidable'); // ;::: ? why
    }

    static _surface(o) {
        o.traits.add('surface');
    }

    static _createTraitControllable(o) {
        o.traits.add('controllable');
    }

    static _displayableText(o, text) {
        o.traits.add('text');
        o.traits.add('displayable');
    }

    static _velocity(o, image) {
        o.traits.add('velocity');
        o.vx = 0;
        o.vy = 0;
    }
}

class ObjectFactory {

    // All those traits-CTOR should move to factory.js
    static _createDefaultObject() {
        let o = {};
        o.traits = new Set();

        // Time To Live: TTL
        //
        // TTLs are name -> int values for properties that 
        // apply accross time or after a time delay. All
        // values in the map are decreased by 1 for every
        // frame of the game.
        o.ttls = new Map();

        o.x = 0;
        o.y = 0;
        return o;
    }

    static _input(ascii, type) {
        let o = ObjectFactory._createDefaultObject();
        o.traits.add('input');
        o.key = ascii;
        o.type = type;
        return o;
    }

    static _unknown() {
        let o = ObjectFactory._createDefaultObject();
        TraitsLibrary._displayable(o, "gfx/unknown.png");
        TraitsLibrary._surface(o);
        return o;
    }

    constructor() {
        this._nameToCT = new Map();

        this._nameToCT.set('gfx/block.png', function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            TraitsLibrary._surface(o);
            return o;
        });

        this._nameToCT.set("gfx/background.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            o.zIndex = 100;
            return o;
        });

        this._nameToCT.set("gfx/background_end.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            o.zIndex = 100;
            return o;
        });

        this._nameToCT.set("gfx/block_special_blue.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            TraitsLibrary._surface(o);
            o.traits.add('block_blue');
            return o;
        });

        this._nameToCT.set("gfx/block_special_red.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            TraitsLibrary._surface(o);
            o.traits.add('block_red');
            return o;
        });

        this._nameToCT.set("gfx/block_bounce_up.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            TraitsLibrary._surface(o);
            o.traits.add('block_up');
            return o;
        });

        this._nameToCT.set("gfx/block_bounce_right.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            TraitsLibrary._surface(o);
            o.traits.add('block_right');
            return o;
        });

        this._nameToCT.set("gfx/tombstone.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            TraitsLibrary._velocity(o);
            o.traits.add('physical_interactions');
            o.vx = (Math.random() - 0.5) * 35.5;
            o.vy = Math.random() * 35.5;
            o.ttls.set('noMaxX', 100);
            return o;
        });

        this._nameToCT.set("gfx/castle.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            return o;
        });

        this._nameToCT.set("gfx/brick.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            TraitsLibrary._surface(o);
            o.traits.add('destroy_by_bottom_collision');
            return o;
        });

        this._nameToCT.set("gfx/water.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            o.traits.add('swimmable');
            o.zIndex = -100;
            return o;
        });

        this._nameToCT.set("gfx/water_full.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            o.traits.add('swimmable');
            o.zIndex = -100;
            return o;
        });

        this._nameToCT.set("gfx/ball.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            TraitsLibrary._velocity(o);
            o.traits.add('physical_interactions');
            o.vx = (Math.random() - 0.5) * 35.5;
            o.vy = Math.random() * 35.5;
            o.ttls.set('noMaxX', 100);
            o.ttls.set('kill', (Math.random() + 0.5) * 1000);
            return o;
        });

        this._nameToCT.set("gfx/brick_fallout.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            TraitsLibrary._velocity(o);
            o.traits.add('physical_interactions');
            o.vx = (Math.random() - 0.5) * 75.5;
            o.vy = Math.random() * 15.5;
            o.ttls.set('kill', (Math.random() + 0.5) * 1000);
            return o;
        });

        this._nameToCT.set("gfx/tree_01.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            return o;
        });

        this._nameToCT.set("gfx/next_level.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            o.traits.add('next_level');
            return o;
        });

        this._nameToCT.set("gfx/tree_02.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            return o;
        });

        this._nameToCT.set("gfx/hero_r0.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            TraitsLibrary._velocity(o);
            TraitsLibrary._createTraitControllable(o);
            o.traits.add('hero');
            o.traits.add('physical_interactions');
            o.zIndex = -50;
            return o;
        });

        this._nameToCT.set("gfx/doggy.png", function(name, o, params) {
            TraitsLibrary._displayable(o, name);
            TraitsLibrary._velocity(o);
            o.traits.add('pet');
            o.traits.add('physical_interactions');
            return o;
        });

        this._nameToCT.set("text", function(name, o, params) {
            TraitsLibrary._displayableText(o);
            o.text = params.text;
            o.size = params.size;
            return o;
        });
    }

    // Creates an object from the raw filename. Example block.png.
    buildFromName(name, params) {
        // Params is {k:value} collection.

        if (this._nameToCT.has(name)) {
            let o = ObjectFactory._createDefaultObject();
            this._nameToCT.get(name)(name, o, params);
            return o;
        }

        console.warn('Unknown object: ' + name);
        return ObjectFactory._unknown();
    }
}
