class Engine {
    constructor() {
        this._time = Date.now() / 1000;
        this._camera = [400, 0];
        this._input = new Set();
        this._fpsData = new Array();
        this._vxMax = 10;

        // kvp: name -> ttl when it applies.
        // This way can have two actions in transitions:
        // - Display something.
        // - (When TTL runs out) apply transition.
        this._transitions = new Map();
        this._factory = new ObjectFactory();
    }

    setWorld(world) {
        this._world = world;
    }

    onKeyPress(ascii) {
        let o = ObjectFactory._input(ascii, 'up');
        this._input.add(o);
    }

    onKeyRelease(ascii) {
        let o = ObjectFactory._input(ascii, 'down');
        for (let k of this._input) {
            if (k.key == o.key) {
                this._input.delete(k);
            }
        }
    }

    // We rely on this running at 60 FPS.
    onTime(timeInsecond) {
        let ds = timeInsecond - this._time;
        this._time = timeInsecond;

        for (let ele of this._world.objectsIterator()) {
            // Remove objects out of ttl.

            if (ele.ttls.has('kill') && ele.ttls.get('kill') <= 0) {
                this._world.deleteObject(ele);
            }

            if (ele.traits.has('hero')) {
                for (let l of this._input) {

                    // Here we probably just want the r object to decide what to do with the input.
                    let vxMax = this._vxMax;
                    if (l.key == 37) {
                        // left
                        ele.vx -= vxMax / 10;
                        if (ele.vx < -vxMax) {
                            ele.vx = -vxMax;
                        }
                    } else if (l.key == 39) {
                        // right 
                        ele.vx += vxMax / 10;
                        if (ele.vx > vxMax) {
                            ele.vx = vxMax;
                        }
                    } else if (l.key == 38 && l.type == 'up') {
                        // ::: if press up for longer, make jump higher
                        if (ele.ttls.has('onSurface') && !ele.ttls.has('noJump')) {
                            ele.vy += 17;
                            this.onKeyRelease(l.key);
                        }
                    }
                }
            }

            // Camera
            if (ele.traits.has('hero')) {
                // ::: just bring screenheight in here
                // ... only chase hero when tries to go away from top boundary ...
                // and chanse from bottom.
                let camera = this._camera;

                camera[0] = ele.x;
                let target = Math.max(0, ele.y - ele.height * 8);

                let speed = 1 / 10 + Math.min(4 / 10, Math.abs(camera[1] - target) / 100);

                camera[1] -= (camera[1] - target) * speed;
            }

            // Animation
            if (ele.traits.has('hero')) {
                // ::: PIXI & such should not be part of engine.
                let img_r = "gfx/hero_r0.png";
                if (ele.vx >= 0 && ele.image != img_r) {
                    ele.image = img_r;
                    ele.sprite.texture = PIXI.Texture.fromImage(ele.image);
                }

                let img_l = "gfx/hero_l0.png";
                if (ele.vx < 0 && ele.image != img_l) {
                    ele.image = img_l;
                    ele.sprite.texture = PIXI.Texture.fromImage(ele.image);
                }
            }

            // Gravity
            //
            // y+
            // ^
            // |
            // |
            // -----> x+
            if (ele.traits.has('physical_interactions')) {
                // Left-right friction.

                if (!ele.ttls.has('noMaxX')) {
                    let pos = ele.vx >= 0;
                    if (!pos) ele.vx = -ele.vx;
                    let maxSpeed = this._vxMax;
                    ele.vx = Math.min(ele.vx, this._vxMax);
                    ele.vx = ele.vx - ele.vx / 10;
                    if (!pos) ele.vx = -ele.vx;
                }

                // Pull-down.
                ele.vy -= 0.7;
            }

            if (ele.traits.has('velocity')) {
                ele.x = ele.x + (ele.vx);
                ele.y = ele.y + (ele.vy);
            }

            // Decrement time to live by 1 for each property.
            for (let kvp of ele.ttls) {
                if (kvp[1] < 0) {
                    // It went through engine once with < 0, now just
                    // remove that property.
                    ele.ttls.delete(kvp[0]);
                } else {
                    ele.ttls.set(kvp[0], kvp[1] - 1);
                }
            }

            for (let kvp of this._transitions) {
                if (kvp[1] < 0) {
                    this._transitions.delete(kvp[0]);
                } else {
                    this._transitions.set(kvp[0], kvp[1] - 1);
                }
            }

            // Kill objects that fall-off stage.
            if (ele.y < -100) {
                ele.ttls.set('kill', 0);
            }

        } // while world objects iteration

        let nObj = 0;
        let nHero = 0;
        let newObjects = new Set();
        for (let el of this._world.objectsIterator()) {
            ++nObj;
            if (el.traits.has('hero')) {
                ++nHero;
            }

            // Apply collisions (don't dedup so (l, r) then (r, l) will happen.
            for (let er of this._world.getNearbyObjects(el)) {
                // el > er: just collide two objects once. Also avoid el == er.
                if (Collisions.isCollide(el, er)) {
                    Collisions.collide(el, er, this._factory, newObjects);
                }
            }

            // World needs to update collision boxes as well
            // as tell the renderer that the object has moved.
            this._world.notifyObjectMoved(el);

            if (el.traits.has('displayable')) {
                // ::: should not access sprite from engine.
                // Camera movement.
                el.sprite.x -= -screenWidth / 4 + this._camera[0];
                el.sprite.y -= -this._camera[1];
            }
        }

        // factory.end <== :::
        if (nHero == 0 && isNaN(this._end) && isNaN(this._factory.end)) {
            this._end = true;
            let text = this._factory.buildFromName('text', {
                text: "You Misstepped!\n\nRefresh browser to try again.",
                size: 50
            });
            text.x = this._camera[0];
            text.y = screenHeight / 2;
            newObjects.add(text);

            for (let i = 0; i < 50; ++i) {
                let tomb = this._factory.buildFromName("gfx/tombstone.png");
                tomb.x = this._camera[0] + 0.25 * screenWidth * (i / 150);
                tomb.y = screenHeight / 2;
                newObjects.add(tomb);
            }
        }

        // If any new object got created, transfer in the world.
        for (let newObject of newObjects) {
            this._world.addObject(newObject);
        }

        this._world.flushBuffers();
    }
}
