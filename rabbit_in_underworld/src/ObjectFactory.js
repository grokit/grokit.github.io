let ObjectFactory_idCount = 0;
class ObjectFactory {

    // All those traits-CTOR should move to factory.js
    static _createDefaultObject() {
        let o = {};
        o.id = ObjectFactory_idCount++;
        o.traits = new Traits();

        // A different way this could work:
        // Attach actions that change data, but otherwise detached from host.
        // host.timedProperties.add( new PropNoJump(host), opt: n.frames );
        // ... start:
        // host.canJump = false;
        // ... when done:
        // host.canJump = true;
        // ... could be done only if host has specific trait.
        //
        // host.timedProperties.add( new PropNoJump(host), opt: n.frames );
        // ... start:
        //  nop
        // ... done:
        // host.remove = True;

        o.x = 0;
        o.y = 0;

        // Overload what happens here if there is record-keeping to do
        // every frame.
        o.tick = function() {}

        return o;
    }

    static _displayable(o, gfxPath) {
        o.image = gfxPath;
        o.traits.add('displayable');
    }

    static _velocity(o) {
        o.traits.add('velocity');
        o.vx = 0;
        o.vy = 0;
    }

    static _surface(o) {
        o.traits.add('surface');
    }

    static _collides_on_surface(o) {
        o.traits.add('collides_on_surface');
    }

    static _gravity(o) {
        o.traits.add('gravity');
    }

    static _gravityLow(o) {
        ObjectFactory._gravity(o);
        o.traits.add('low_gravity');
    }

    static _displayableText(o, text) {
        o.traits.add('text');
        o.traits.add('displayable');
    }

    static _input(ascii, type) {
        let o = ObjectFactory._createDefaultObject();
        o.traits.add('input');
        o.key = ascii;
        o.type = type;
        return o;
    }

    static _unknown(name) {
        let o = ObjectFactory._createDefaultObject();
        ObjectFactory._displayable(o, name);
        return o;
    }

    constructor(world) {
        this._world = world;
        this._nameToCT = new Map();

        this._nameToCT.set('gfx/ground_lr.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            o.traits.add('immune_to_lethal');
            return o;
        });

        this._nameToCT.set('gfx/ground_lr2.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            o.traits.add('immune_to_lethal');
            return o;
        });

        this._nameToCT.set('gfx/block_fall_on_touch.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            ObjectFactory._collides_on_surface(o);
            o.traits.add('fall_on_touch');
            return o;
        });

        this._nameToCT.set('gfx/flying_fire.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o, name);
            ObjectFactory._gravity(o, name);
            o.traits.add('lethal');
            o.traits.add('immune_to_lethal');

            o.firstY = -1;
            o.paused = -1;
            o.speed = 25;
            o.zIndex = -5;
            o.pauseTime = 100 + 25 * Math.random();

            o.tick = function() {
                if (o.paused >= 0) {
                    o.paused -= 1;
                    if (o.y < o.firstY) {
                        o.y = o.firstY;
                        o.vy = 0;
                    }
                } else {
                    if (o.firstY == -1) {
                        o.firstY = o.y;
                    }

                    o.y = o.firstY;
                    o.vy = o.speed;
                    o.paused = o.pauseTime;
                }
            }

            return o;
        });

        this._nameToCT.set('gfx/platform_left_right.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            ObjectFactory._velocity(o, name);
            o.traits.add('moving_platform');
            o.traits.add('immune_to_lethal');

            o.firstX = -1;
            o.paused = -1;
            o.speed = 2;
            o.dir = 1;
            o.vx = o.speed;
            o.span = -1;
            o.pauseTime = 100;

            o.tick = function() {
                if (o.paused >= 0) {
                    o.paused -= 1;
                    o.vx = 0;
                } else {
                    o.vx = o.speed * o.dir;

                    if (o.firstX == -1) {
                        o.firstX = o.x;
                    }

                    // -1: advance infinite or until hit wall.
                    if (o.span != -1) {
                        if (o.x > o.firstX + o.span) {
                            o.x = o.firstX + o.span - o.vx;
                            o.dir *= -1;
                            o.paused = o.pauseTime;
                        } else if (o.x < o.firstX) {
                            o.x = o.firstX - o.vx;
                            o.dir *= -1;
                            o.paused = o.pauseTime;
                        }
                    }
                }
            }

            return o;
        });

        this._nameToCT.set('gfx/spike_ceiling.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            o.traits.add('lethal');
            return o;
        });
        
        this._nameToCT.set('gfx/spike_ceiling_falling.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            o.traits.add('lethal');
            o.traits.add('stomp_on_object_below');

            o.objectBelow = function() {
                ObjectFactory._gravity(o);
                ObjectFactory._velocity(o);
            }

            return o;
        });

        this._nameToCT.set('gfx/lava.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            o.traits.add('lethal');
            o.traits.add('immune_to_lethal');
            return o;
        });

        this._nameToCT.set('gfx/smoke_dust.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            o.traits.add('low_gravity');
            o.traits.add('immune_to_lethal');
            return o;
        });

        this._nameToCT.set('gfx/doggy.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            return o;
        });

        this._nameToCT.set('gfx/spikes.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            ObjectFactory._collides_on_surface(o);
            o.traits.add('lethal');
            return o;
        });

        this._nameToCT.set('gfx/tombstone.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            ObjectFactory._collides_on_surface(o);
            return o;
        });

        this._nameToCT.set('gfx/door_next_level.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            o.traits.add('to_next_level');
            return o;
        });

        this._nameToCT.set('gfx/mr_spore.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            ObjectFactory._collides_on_surface(o);
            o.traits.add('stompable');
            o.traits.add('walks');
            o.traits.add('destroy_to_squished');
            o.walkDirection = -1; // -1 = left.
            return o;
        });

        this._nameToCT.set('gfx/stompy.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._collides_on_surface(o);

            o.traits.add('lethal');
            o.traits.add('stomp_on_object_below');
            o.stompState = 'waiting';
            o.waitingCount = 25;
            o.vy = 3;

            o.tick = function() {
                if (o.stompState == 'falling') {
                    if (o.waitingCount > 0) {
                        o.waitingCount -= 1;
                    } else {
                        o.waitingCount = 200;
                        o.stompState = 'up';
                        o.vy = 3;
                    }
                }

                if (o.stompState == 'up') {
                    if (o.waitingCount > 0) {
                        o.waitingCount -= 1;
                    } else {
                        o.stompState = 'waiting';
                        o.waitingCount = 200;
                    }
                }
            }

            o.objectBelow = function() {
                if (o.stompState == 'waiting') {
                    o.stompState = 'falling';
                    o.vy = -10;
                    o.waitingCount = 100;
                }
            }

            return o;
        });

        this._nameToCT.set('gfx/l0_splash.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            o.traits.add('decoration');
            o.traits.add('splash');
            o.next = false;
            o.frameCount = 0;

            o.tick = function() {
                o.frameCount += 1;
                if (o.frameCount > 100) {
                    o.next = true;
                }
            }

            return o;
        });

        this._nameToCT.set('gfx/squished.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            ObjectFactory._collides_on_surface(o);
            o.traits.add('decoration');
            return o;
        });

        this._nameToCT.set('gfx/canon_horizontal.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._collides_on_surface(o);
            ObjectFactory._surface(o);

            let shootFreq = 150;

            o.shootNext = shootFreq + (shootFreq / 10) * (1 + Math.random());
            o.traits.add('canon_shoot');

            o.shoot = function() {
                let bullet = params.factory.buildFromName("gfx/canon_bullet_left.png");
                params.world.addObject(bullet);
                bullet.x = o.x - bullet.width;
                bullet.y = o.y + o.height - bullet.height - 1;
                bullet.traits.set('kill', 1000);
                bullet.vx = -15 - 8 * Math.random();
            }

            o.tick = function() {
                o.shootNext -= 1;
                if (o.shootNext < 0) {
                    o.shootNext = shootFreq + (shootFreq / 10) * (1 + Math.random());
                    o.shoot();
                }
            }

            return o;
        });

        this._nameToCT.set('gfx/canon_bullet_left.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._collides_on_surface(o);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            o.traits.add('stompable');
            o.traits.add('bullet');
            o.traits.add('low_gravity');
            return o;
        });

        this._nameToCT.set("gfx/hero_r0.png", function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._collides_on_surface(o);
            ObjectFactory._gravity(o);

            o.traits.add('hero');
            o.zIndex = 50;
            return o;
        });

        this._nameToCT.set("text", function(name, o, params) {
            ObjectFactory._displayableText(o);
            o.text = params.text;
            o.size = params.size;
            return o;
        });
    }

    buildGameStateObject(actionName, actionData) {
        let o = ObjectFactory._createDefaultObject();
        o.traits.add('game_state');
        o.action = actionName;
        o.data = actionData;
        return o;
    }

    // Creates an object from the raw filename. Example block.png.
    // Params is {k:value} collection.
    buildFromName(name, params) {

        if (this._nameToCT.has(name)) {
            let o = ObjectFactory._createDefaultObject();
            let params = {};
            params.world = this._world;
            params.factory = this;
            return this._nameToCT.get(name)(name, o, params);
        }

        console.warn('Unknown object: ' + name);
        return ObjectFactory._unknown(name);
    }
}
