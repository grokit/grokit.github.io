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

        o.x = -1;
        o.y = -1;

        // 1.0: absolute / max
        // 0.0: min
        o.getSolidity = function(){return 0.5;}

        // Overload what happens here if there is record-keeping to do
        // every frame.
        o.tick = function() {}

        return o;
    }

    static _displayable(o, gfxPath) {
        o.image = gfxPath;
        o.traits.add('displayable');
    }

    static _background(o, name) {
        o.traits.add('background');
        o.zIndex = -50;
    }

    static _velocity(o) {
        o.traits.add('velocity');
        o.vx = 0;
        o.vy = 0;
    }

    static _surface(o) {
        o.traits.add('surface');
    }

    static _stands_on_surface(o) {
        o.traits.add('stands_on_surface');
    }

    static _pushable(o) {
        o.traits.add('pushable');
        ObjectFactory._velocity(o);
    }

    static _draggable(o) {
        o.traits.add('draggable');
        ObjectFactory._velocity(o);
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
        o.unixtimeMs = (new Date()).getTime();
        return o;
    }

    static _unknown(name) {
        let o = ObjectFactory._createDefaultObject();
        o.name = name;
        ObjectFactory._displayable(o, name);
        ObjectFactory._background(o, name);
        return o;
    }

    static isStompableObjectBelow(obj, world) {
        let lookBelow = 600;
        let widen = 50;
        let below = world.select(obj.x - widen, obj.y - 1 - lookBelow, obj.width + widen / 2, lookBelow);

        for (let nearbyObj of below) {
            if (!nearbyObj.traits.has('surface') && !nearbyObj.traits.has('decoration')) {
                return true;
            }
        }

        return false;
    }

    constructor(world) {
        this._world = world;
        this._nameToCT = new Map();

        this._nameToCT.set('gfx/ground_lr.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            o.traits.add('immune_to_lethal');
            o.getSolidity = function(){return 0.9;}
            return o;
        });

        this._nameToCT.set('gfx/ground_lr2.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            o.traits.add('immune_to_lethal');
            o.getSolidity = function(){return 0.9;}
            return o;
        });

        this._nameToCT.set('gfx/explosion_big.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            o.traits.add('decoration');
            return o;
        });

        this._nameToCT.set('gfx/gorilla_projectile.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            o.traits.add('immune_to_lethal');
            o.traits.add('lethal');
            return o;
        });

        this._nameToCT.set('gfx/bush_stackable.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            o.traits.add('decoration');
            o.zIndex = -50;
            return o;
        });

        this._nameToCT.set('gfx/bush_branch.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            o.traits.add('surface_top_only');
            o.traits.add('no_overlap_kill');
            o.height *= 0.6;
            o.zIndex = -50;

            o.getSolidity = function(){
                return 0.05;
            }

            return o;
        });

        this._nameToCT.set('gfx/explosion_small.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            o.traits.add('decoration');
            return o;
        });

        this._nameToCT.set('gfx/magic_potion.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            ObjectFactory._stands_on_surface(o);
            o.traits.add('transform_to_gorilla');
            return o;
        });

        this._nameToCT.set('gfx/pants_gorilla_r0.png', function(name, o, params) {
            // Inherit.
            let nameParent = 'gfx/hero_r0.png';
            o = params.world.getFactory()._nameToCT.get(nameParent)(nameParent, o, params);
            o.image = 'gfx/pants_gorilla_r0.png';
            params.world.getFactory().updateSprite(o);

            // Adapt.
            o.traits.add('hero_strong_mode');
            o.traits.add('immune_to_lethal');
            o.cooldown = 10;

            o.tickParent = o.tick
            o.tick = function(){
                o.tickParent();
                o.cooldown = Math.min(10, o.cooldown +1);
            }

            o.inputParent = o.input;
            o.input = function(l){
                o.inputParent(l);

                if ((l.key == 88 || l.key == 90) && l.type == 'up') {
                    let bomb = false;
                    if (l.key == 88 && l.type == 'up') {
                        bomb = true;
                    }

                    if(o.cooldown >= 10){
                        let projectile = params.world.getFactory().buildFromName("gfx/gorilla_projectile.png");
                        if(bomb){
                          projectile = params.world.getFactory().buildFromName("gfx/bomb.png");
                        }
                        projectile.x = o.x + o.width + 1;
                        projectile.y = o.y + o.height - projectile.height;
                        projectile.phase = 100;

                        if(o.image.search("_l.png") == -1){
                            projectile.vx = 40;
                        } else {
                            projectile.x = o.x - projectile.width - 1;
                            projectile.vx = -40;
                        }

                        projectile.vy = 20;
                        params.world.addObject(projectile);
                        projectile.traits.set('kill', 2000);

                        o.cooldown -= 10;
                    }
                }
            }

            return o;
        });

        this._nameToCT.set('gfx/turtle_r0.png', function(name, o, params) {
            // Inherit.
            let nameParent = 'gfx/hero_r0.png';
            o = params.world.getFactory()._nameToCT.get(nameParent)(nameParent, o, params);
            o.image = 'gfx/turtle_r0.png';
            params.world.getFactory().updateSprite(o);

            // Adapt.
            o.speedFactor *= 0.5;

            return o;
        });


        // Little green stuff.
        this._nameToCT.set('gfx/jumpee.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            ObjectFactory._stands_on_surface(o);
            o.traits.add('walks');
            o.traits.add('no_overlap_kill');

            // 0: looking for target
            o.phase = 0;
            o.walkDirection = -1; // -1 = left.

            o.hitObstacle = function() {
                o.walkDirection *= -1;
            }

            o.tick = function() {
                if (o.phase == 0) {
                    if (o.traits.has('on_surface')) {
                        let widen = 400;
                        let objSides = world.select(o.x - widen, o.y, o.width + widen, o.height * 3);
                        for (let sObj of objSides) {
                            if (sObj.traits.has('hero')) {
                                let dir = 1;
                                if (sObj.x > o.x) {
                                    dir = -1;
                                }

                                o.walkDirection = dir;
                                o.phase = 150;

                                if (Math.random() > 0.7) {
                                    // Jump away.
                                    if (Math.random() > 0.8) {
                                        dir *= -1;
                                    }

                                    o.vx = dir * 20 * (0.5 + Math.random());
                                    o.vy = 14 * (0.5 + Math.random());
                                }
                            }
                        }
                    }
                    o.phase = 10;
                } else {
                    if (o.phase > 0) {
                        o.phase -= 1;
                    }
                    o.vx += 0.2 * o.walkDirection;
                }
            }

            return o;
        });

        this._nameToCT.set('gfx/block_fall_on_touch.png', function(name, o, params) {


            // :::
            let maxTolerance = 15;
            let tolerance = maxTolerance;
            o.touched = function() {

                tolerance -= 1;

                if (tolerance == Math.floor(maxTolerance * 0.8)) {
                    o.image = "gfx/block_fall_on_touch_damaged.png";
                    params.world.getFactory().updateSprite(o);
                }

                if (tolerance == Math.floor(maxTolerance * 0.2)) {
                    o.image = "gfx/block_fall_on_touch_damaged_02.png";
                    params.world.getFactory().updateSprite(o);
                }

                if (tolerance == 0) {
                    ObjectFactory._velocity(o);
                    ObjectFactory._gravity(o);
                    o.vy = 0;
                }
            }

            let subLevel = 0;
            o.tick = function() {
                if (tolerance > 0 && tolerance < maxTolerance) {
                    subLevel += 0.1;

                    if (subLevel >= 1) {
                        subLevel = 0;
                        tolerance = Math.min(maxTolerance, tolerance + 1);

                        if (tolerance == maxTolerance) {
                            o.image = "gfx/block_fall_on_touch.png";
                            params.world.getFactory().updateSprite(o);
                        }

                        if (tolerance == Math.floor(maxTolerance * 0.2) + 1) {
                            o.image = "gfx/block_fall_on_touch_damaged.png";
                            params.world.getFactory().updateSprite(o);
                        }
                    }
                }
            }

            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            ObjectFactory._stands_on_surface(o);
            o.traits.add('fall_on_touch');
            o.traits.add('destroy_to_smoke');
            return o;
        });

        this._nameToCT.set('gfx/block_pushable.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            ObjectFactory._stands_on_surface(o);
            ObjectFactory._pushable(o);
            o.traits.add('destroy_to_smoke');
            return o;
        });

        this._nameToCT.set('gfx/fountain.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            ObjectFactory._stands_on_surface(o);

            o.phase = 0;
            o.tick = function() {
                o.phase += 1;

                if (o.phase % 1 == 0) {
                    for (let i = 0; i < 1; ++i) {
                        let smoke = params.world.getFactory().buildFromName("gfx/smoke_dust.png");
                        smoke.x = o.x + o.width * 0.5 + (Math.random() - 0.5) * o.width;
                        smoke.y = o.y + o.height;
                        smoke.vx = (0.5 - Math.random()) * 10;
                        smoke.vy = 2 + (0.25 - Math.random()) * 3;
                        params.world.addObject(smoke);
                        smoke.traits.set('kill', 1000);
                    }
                }
            }


            return o;
        });

        this._nameToCT.set('gfx/spring_jump_up.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            ObjectFactory._stands_on_surface(o);
            o.traits.add('walked_on_action');

            o.phase = -1;

            o.onWalkedOn = function(crr) {
                o.image = "gfx/spring_jump_up_extended.png";
                params.world.getFactory().updateSprite(o);
                o.height = o.sprite.texture.height;
                o.width = o.sprite.texture.width;

                crr.y = o.y + o.height;

                crr.vy += 18;
                o.phase = 25;

                Audio.play('sounds/sfx/object_generic_squished.ogg', 0.5, false);
            }

            o.tick = function() {
                if (o.phase >= 0) {
                    o.phase -= 1;
                }

                if (o.phase == 0) {
                    o.image = "gfx/spring_jump_up.png";
                    params.world.getFactory().updateSprite(o);
                    o.height = o.sprite.texture.height;
                    o.width = o.sprite.texture.width;
                }
            }

            return o;
        });

        this._nameToCT.set('gfx/vampire_wannabe.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            ObjectFactory._stands_on_surface(o);
            o.traits.add('walks');
            o.traits.add('lethal');
            o.traits.add('immune_to_lethal');
            o.traits.add('stompable');

            // 0: looking for target
            o.phase = 0;
            o.walkDirection = -1; // -1 = left.

            o.hitObstacle = function() {
                o.walkDirection *= -1;
            }

            o.tick = function() {
                if (o.phase == 0) {
                    if (o.traits.has('on_surface')) {
                        let widen = 500;
                        let objSides = params.world.select(o.x - widen, o.y, o.width + widen, o.height * 3);
                        for (let sObj of objSides) {
                            if (sObj.traits.has('hero')) {
                                let dir = -1;
                                if (sObj.x > o.x) {
                                    dir = 1;
                                }

                                o.walkDirection = dir;
                                o.phase = 40;

                                if (Math.random() > 0.9) {
                                    dir *= -1;
                                }
                                o.vx = dir * 20 * (0.5 + Math.random());
                                o.vy = 14 * (0.5 + Math.random());
                            }
                        }

                        // Didn't find someone to jump on.
                        if (o.phase == 0) {
                            o.vx += 0.2 * o.walkDirection;
                        }

                    }
                } else {
                    o.phase -= 1;
                }
            }

            return o;
        });

        this._nameToCT.set('gfx/cloud.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            ObjectFactory._velocity(o);

            o.traits.add('surface_top_only');
            o.traits.add('no_overlap_kill');

            o.getSolidity = function(){
                return 0.05;
            }

            o.origHeight = o.height;
            o.height *= 0.65;
            o.zIndex = 75;
            o.nSupport = 0;
            o.initYPlaced = false;

            return o;
        });

        this._nameToCT.set('gfx/flying_fire.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o, name);
            ObjectFactory._gravity(o);
            o.traits.add('lethal');
            o.traits.add('immune_to_lethal');
            o.traits.add('low_gravity');
            o.traits.add('no_overlap_kill');

            o.firstY = -1;
            o.paused = -1;
            o.speed = 10;
            o.zIndex = -5;
            o.pauseTime = 120 + 25 * Math.random();

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
            o.traits.add('offscreen_process');
            o.traits.add('immune_to_lethal');

            o.firstX = -1;
            o.paused = -1;
            o.speed = 1.8;
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

        this._nameToCT.set('gfx/bomb.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._gravity(o);
            ObjectFactory._stands_on_surface(o);
            ObjectFactory._draggable(o);
            o.traits.add('bomb');
            o.traits.add('immune_to_lethal');

            o.phase = -1;
            o.ignite = function() {
                if (o.phase == -1) {
                    o.phase = 70;
                    o.image = "gfx/bomb_ignited.png";
                    params.world.getFactory().updateSprite(o);
                }
            }

            o.tick = function() {
                if (o.phase == 0) {
                    o.traits.set('kill', 0);

                    Collisions.makeSmokeAt(o, params.world, 20, o.height * 0.9);

                    let explosion = world.getFactory().buildFromName("gfx/explosion_big.png");
                    world.addObject(explosion);
                    explosion.x = o.x - explosion.width / 2 + o.width / 2;
                    explosion.y = o.y - explosion.height / 2 + o.height / 2;
                    explosion.vx = 0;
                    explosion.vy = 7;
                    explosion.traits.set('kill', 1000);
                    explosion.traits.set('explosion_applies_outward_force', 2);
                    params.world.notifyObjectMoved(explosion);

                    for (let i = 0; i < 20; ++i) {
                        let explosion = world.getFactory().buildFromName("gfx/explosion_small.png");
                        world.addObject(explosion);
                        explosion.x = o.x - explosion.width / 2 + o.width / 2;
                        explosion.y = o.y - explosion.height / 2 + o.height / 2;
                        explosion.vx = (Math.random() - 0.5) * 8;
                        explosion.vy = 10 + Math.random() * 5;
                        explosion.traits.set('kill', 1000);
                        params.world.notifyObjectMoved(explosion);
                    }
                } else {
                    if (o.phase > 0) {
                        o.phase -= 1;
                    }
                }
            }

            return o;
        });

        this._nameToCT.set('gfx/spike_ceiling_falling.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            o.traits.add('lethal');
            o.traits.add('stomp_on_object_below');
            o.traits.add('destroy_to_smoke');
            // -2: ready, -1: disabled, 0: trigger fall, > 0 wait.
            o.falling = -2;

            o.tick = function() {
                let isObjectBelow = ObjectFactory.isStompableObjectBelow(o, params.world);
                if (isObjectBelow) {
                    if (o.falling == -2) {
                        o.falling = 20;
                    }

                    if (o.falling > 10 && o.falling % 3 == 0) {
                        Collisions.makeSmokeAt(o, params.world, 1, o.height * 0.9);
                    }
                }

                if (o.falling > -1) {
                    o.falling -= 1;
                }

                if (o.falling == 0) {
                    o.vy = -10;
                    Audio.play('sounds/sfx/canon_shooting.ogg', 0.5, false);
                }
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

        this._nameToCT.set('gfx/button_floor.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            o.traits.add('button');

            o.zIndex = 25;

            //-1: up, >= -1: up
            o.state = -1;

            o.press = function() {
                if (o.state == -1) {
                    o.state = 1000;
                    o.image = "gfx/button_floor_pressed.png";
                    params.world.getFactory().updateSprite(o);

                    params.world.setBackgoundColor(0xcc0000);
                }
            }

            o.tick = function() {
                if (o.state > -1) {
                    o.state -= 1;
                }

                if (o.state == 0) {
                    o.image = "gfx/button_floor.png";
                    params.world.getFactory().updateSprite(o);
                }
            }

            return o;
        });

        this._nameToCT.set('gfx/smoke_dust.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            o.traits.add('low_gravity');
            o.traits.add('immune_to_lethal');
            o.traits.add('decoration');
            return o;
        });

        this._nameToCT.set('gfx/doggy.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            o.traits.add('decoration');
            o.traits.add('stompable');
            o.traits.add('destroy_to_squished');
            return o;
        });

        this._nameToCT.set('gfx/spikes.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._surface(o);
            ObjectFactory._stands_on_surface(o);
            o.traits.add('lethal');
            return o;
        });

        this._nameToCT.set('gfx/tombstone.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            ObjectFactory._stands_on_surface(o);
            o.traits.add('decoration');
            return o;
        });

        this._nameToCT.set('gfx/door_next_level.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            o.traits.add('to_next_level');
            o.traits.add('offscreen_process');
            o.traits.add('immune_to_lethal');
            return o;
        });

        this._nameToCT.set('gfx/door_next_level_wide.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            o.traits.add('to_next_level');
            o.traits.add('offscreen_process');
            o.traits.add('immune_to_lethal');
            o.traits.add('camera_ignore');
            return o;
        });

        this._nameToCT.set('gfx/brick_gray_bg.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            o.traits.add('decoration');
            o.zIndex = -50;
            return o;
        });

        this._nameToCT.set('gfx/mr_spore.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            ObjectFactory._stands_on_surface(o);
            o.traits.add('stompable');
            o.traits.add('destroy_to_squished');
            o.traits.add('walks');
            o.traits.add('self_collide_change_dir');
            o.walkDirection = -1; // -1 = left.

            o.getSolidity = function(){
                return 0.25;
            }

            o.hitObstacle = function() {
                o.walkDirection *= -1;
            }

            o.tick = function() {
                if (o.traits.has('on_surface')) {
                    o.vx += 0.2 * o.walkDirection;
                }
            }
            return o;
        });

        this._nameToCT.set('gfx/fancy_city_dweller.png', function(name, o, params) {
            // Inherit.
            let nameParent = 'gfx/mr_spore.png';
            o = params.world.getFactory()._nameToCT.get(nameParent)(nameParent, o, params);
            o.image = 'gfx/fancy_city_dweller.png';
            params.world.getFactory().updateSprite(o);

            // Adapt.
            o.traits.remove('stompable');
            o.traits.remove('destroy_to_squished');
            o.traits.add('push_hero');

            o.tick = function() {
                if (o.traits.has('on_surface')) {
                    o.vx += 0.3 * o.walkDirection;

                    if(Math.random() > 0.995){
                        o.vy = 10;
                        o.vx = (0.5 - Math.random()) * 50;
                    }
                }
            }

            return o;
        });

        this._nameToCT.set('gfx/elephanko.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._gravity(o);
            ObjectFactory._stands_on_surface(o);
            o.traits.add('walks');

            o.walkDirection = -1; // -1 = left.
            o.hitObstacle = function() {
                o.walkDirection *= -1;
            }

            o.tick = function() {
                if (o.traits.has('on_surface')) {
                    o.vx += 0.2 * o.walkDirection;
                }
            }
            return o;
        });

        this._nameToCT.set('gfx/stompy.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._stands_on_surface(o);
            ObjectFactory._surface(o);

            o.traits.add('stomp_on_object_below');
            o.stompState = 'waiting';
            o.waitingCount = 25;
            //o.vy = 4.0;

            o.initY = -1;
            o.initYPlaced = false;

            o.getSolidity = function(){
                return 0.8;
            }

            o.tick = function() {
                if (o.initYPlaced == false) {
                    o.initY = o.y;
                    o.initYPlaced = true;
                    // First tick gets out of collision, don't waste
                    // in case falling state + enemy below.
                    return;
                }

                if (o.stompState == 'waiting') {
                    let isObjectBelow = ObjectFactory.isStompableObjectBelow(o, params.world);

                    if (isObjectBelow) {
                        if (o.stompState == 'waiting') {
                            o.stompState = 'falling';
                            o.vy = -8;
                            o.waitingCount = 100;
                            return;
                        }
                    }
                }

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

                if (o.y > o.initY) {
                    o.y = o.initY;
                    o.vy = 0;
                }
            }

            return o;
        });

        this._nameToCT.set('gfx/squished.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._stands_on_surface(o);
            ObjectFactory._gravity(o);
            o.zIndex = -85;
            o.getSolidity = function(){
                return 0.25;
            }
            return o;
        });

        this._nameToCT.set('gfx/stars_black_sky.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            o.traits.add('decoration');
            o.zIndex = -95;
            return o;
        });

        this._nameToCT.set('gfx/canon_horizontal.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._stands_on_surface(o);
            ObjectFactory._surface(o);

            let shootFreq = Math.round(200 + 25 * Math.random());

            o.zIndex = 75;
            o.height *= 0.95;
            o.shootNext = shootFreq;
            o.traits.add('canon_shoot');

            o.shoot = function() {
                let bullet = params.factory.buildFromName("gfx/canon_bullet_left.png");
                params.world.addObject(bullet);
                bullet.x = o.x - bullet.width;
                bullet.y = o.y + o.height - bullet.height - 1;
                bullet.traits.set('kill', 1000);
                bullet.vx = -5;
                Audio.play('sounds/sfx/canon_shooting.ogg', 0.5, false);

                // We BADLY need a proper function to create objects in world.
                params.world.notifyObjectMoved(bullet);
            }

            o.tick = function() {
                o.shootNext -= 1;

                if (o.shootNext == Math.round(shootFreq * 0.3)) {
                    o.image = "gfx/canon_horizontal_shoot_soon.png";
                    params.world.getFactory().updateSprite(o);
                }

                if (o.shootNext < 0) {
                    o.image = "gfx/canon_horizontal.png";
                    params.world.getFactory().updateSprite(o);
                    o.shootNext = shootFreq;
                    o.shoot();
                }
            }

            ObjectFactory._gravity(o);
            //ObjectFactory._pushable(o);
            return o;
        });

        this._nameToCT.set('gfx/canon_bullet_left.png', function(name, o, params) {
            ObjectFactory._displayable(o, name);
            ObjectFactory._stands_on_surface(o);
            ObjectFactory._velocity(o);
            o.traits.add('stompable');
            o.traits.add('bullet');
            o.traits.add('destroy_to_smoke');

            return o;
        });

        this._nameToCT.set("gfx/hero_r0.png", function(name, o, params) {

            ObjectFactory._displayable(o, name);
            ObjectFactory._velocity(o);
            ObjectFactory._stands_on_surface(o);
            ObjectFactory._gravity(o);

            o.traits.add('hero');
            o.traits.add('tracked_by_camera');
            o.zIndex = 50;
            o.speedFactor = 1.0;

            o.traits.add('controllable');
            o.input = function(l) {
                let obj = o;

                let vxMax = 5.5 * o.speedFactor;
                if (l.key == 37 && l.type == 'up') {
                    // left
                    if (obj.vx - vxMax / 10 > -vxMax) {
                        obj.vx -= vxMax / 10;
                    }

                    obj.image = obj.image.replace('_r0', '_l0');
                    params.world.getFactory().updateSprite(obj);
                } else if (l.key == 39 && l.type == 'up') {
                    // right 
                    if (obj.vx + vxMax / 10 < vxMax) {
                        obj.vx += vxMax / 10;
                    }

                    obj.image = obj.image.replace('_l0', '_r0');
                    params.world.getFactory().updateSprite(obj);

                } else if (l.key == 38) {
                    if (l.type == 'up') {
                        obj.traits.set('press_jump', 5);

                        // Prevent long-up press to re-jump after
                        // object has landed; requires another press
                        // from user.
                        let skip = false;
                        let nowMs = (new Date()).getTime();
                        if (nowMs - l.unixtimeMs > 100) {
                            skip = true;
                        }

                        if (!skip && obj.traits.has('on_surface') && !obj.traits.has('jumping')) {

                            obj.vy = 6*o.speedFactor;

                            obj.traits.set('on_surface', 0);
                            obj.traits.set('jumping', 15);

                            if (obj.traits.has('jump_boost')) {
                                obj.vy += 6*o.speedFactor;
                            }

                            Audio.play('sounds/sfx/jumpland.ogg', 0.5, false);
                        }

                    } else if (l.type == 'down') {
                        obj.traits.remove('jumping');
                    } else {
                        throw "unknown input";
                    }
                }
            }

            return o;
        });

        this._nameToCT.set("gfx/bg-forest.png", function(name, o, params) {
            ObjectFactory._displayable(o, name);
            o.traits.add('background_slow_scroll');
            o.traits.add('camera_ignore');
            o.traits.add('decoration');
            o.zIndex = -75;
            return o;
        });

        this._nameToCT.set("text", function(name, o, params) {
            ObjectFactory._displayableText(o);
            o.text = params.text;
            o.size = params.size;
            return o;
        });
    }

    updateSprite(obj){
        this._world.updateSprite(obj);
    }

    // Creates an object from the raw filename. Example block.png.
    // Params is {k:value} collection.
    buildFromName(name, params) {

        if (this._nameToCT.has(name)) {
            let o = ObjectFactory._createDefaultObject();
            o.name = name;
            let params = {};
            params.world = this._world;
            params.factory = this;

            // Done to make sure obj factory has access
            // to width and height.
            o.image = name;
            this._world.loadSprite(o);

            return this._nameToCT.get(name)(name, o, params);
        }

        console.warn('Unknown object: ' + name);

        let o = ObjectFactory._unknown(name);
        o.traits.add('decoration');
        o.image = name;
        this._world.loadSprite(o);
        return o;
    }
}
