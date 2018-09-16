
class Engine {
    constructor(world, screenWidth, screenHeight) {
        this._world = world;

        this._screenWidth = screenWidth;
        this._screenHeight = screenHeight;

        this._time = Date.now() / 1000;
        this._baseY = 4 * 64;
        this._camera = [4 * 64, this._baseY];
        this._input = new Set();
        this._fpsData = new Array();
        this._vxMax = 7;

        this._gameOverseer = new GameOverseer(this._world);
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
        if (Constants.isSlowDown()) {
            for (let i = 0; i < 1e8; ++i) {
                let y = i * i;
            }
        }

        let ds = timeInsecond - this._time;
        this._time = timeInsecond;

        this._gameOverseer.notifyBegin();
        for (let obj of this._world.objectsIterator()) {

            // Ticks trigger...
            this._gameOverseer.tick(obj);
            obj.tick();
            obj.traits.tick();

            // Remove objects out of ttl.
            if (obj.traits.has('engine_rm')) {
                this._world.deleteObject(obj);
            }

            // :-:: replace this by controllable -- and pass to object here
            // ---- especially the graphics
            if (obj.traits.has('hero')) {
                for (let l of this._input) {

                    // Here we probably just want the r object to decide what to do with the input.
                    let vxMax = this._vxMax;
                    if (l.key == 37) {
                        // left
                        if (obj.vx - vxMax / 10 > -vxMax) {
                            obj.vx -= vxMax / 10;
                        }

                        let img_l = "gfx/hero_l0.png";
                        obj.image = img_l;
                        obj.sprite.texture = PIXI.Texture.fromImage(obj.image);
                    } else if (l.key == 39) {
                        // right 
                        if (obj.vx + vxMax / 10 < vxMax) {
                            obj.vx += vxMax / 10;
                        }

                        let img_r = "gfx/hero_r0.png";
                        if (obj.image != img_r) {
                            obj.image = img_r;
                            obj.sprite.texture = PIXI.Texture.fromImage(obj.image);
                        }

                    } else if (l.key == 38 && l.type == 'up') {
                        if (obj.traits.has('on_surface') && !obj.traits.has('no_jump')) {
                            obj.vy = 18;
                            obj.traits.set('on_surface', 0);
                            this.onKeyRelease(l.key);
                        }
                    }
                }
            }

            // Camera
            if (obj.traits.has('hero')) {
                let camera = this._camera;

                let type = 'siege';
                if (type == 'siege') {

                    camera[0] = obj.x;

                    let target = Math.max(this._baseY, obj.y - this._baseY - obj.height * 4);

                    // --> Math.max ?
                    let speed = 1 / 10 + Math.min(4 / 10, Math.abs(camera[1] - target) / 100);

                    camera[1] -= (camera[1] - target) * speed;
                }
            }

            // Gravity
            //
            // y+
            // ^
            // |
            // |
            // -----> x+
            if (obj.traits.has('gravity')) {
                let pullForce = 0.7;
                let friction = 1 / 10;

                if (obj.traits.has('low_gravity')) {
                    pullForce /= 15;
                    friction /= 4.5;
                }

                // Left-right friction.
                let pos = obj.vx >= 0;
                if (!pos) obj.vx = -obj.vx;
                obj.vx = obj.vx - obj.vx * friction;
                if (!pos) obj.vx = -obj.vx;

                // Pull-down.
                obj.vy -= pullForce;
            }

            if (obj.traits.has('velocity')) {
                obj.x = obj.x + (obj.vx);
                obj.y = obj.y + (obj.vy);

                if (Math.abs(obj.vx) < 0.001) obj.vx = 0;
                if (Math.abs(obj.vy) < 0.001) obj.vy = 0;
            }

            if (obj.traits.has('stomp_on_object_below')) {
                let yOrig = obj.y;
                let triggered = false;
                for (let i = 0; i < 15; ++i && !triggered) {
                    for (let nearbyObj of this._world.getNearbyObjects(obj)) {
                        if (nearbyObj != obj && !nearbyObj.traits.has('surface') && !nearbyObj.traits.has('decoration')) {
                            if (Collisions.isCollide(nearbyObj, obj)) {
                                triggered = true;
                                break;
                            }
                        }
                    }

                    obj.y = obj.y - obj.height;
                }

                if (triggered) {
                    obj.objectBelow();
                }

                obj.y = yOrig;
            }

            // Kill objects that fall-off stage.
            if (obj.y <= -100) {
                obj.traits.set('kill', 0);
            }

            if (obj.traits.has('walks') && obj.traits.has('on_surface')) {
                obj.vx += 0.2 * obj.walkDirection;
            }

        } // while world objects iteration

        // We apply collisions in a seperate loop to avoid having the following
        // sequence of events:
        // - obj1 removed from colision with obj2.
        // - obj1 applied gravity down
        //
        // This could also be resolved by making sure the object action on
        // in collision function is always the same one that was already
        // moved.
        for (let obj of this._world.objectsIterator()) {
            // Apply collisions; don't dedup so (l, r) then (r, l) will happen.
            for (let nearbyObj of this._world.getNearbyObjects(obj)) {
                // Convention: current object is on RHS.
                if (nearbyObj != obj) {
                    if (Collisions.isCollide(nearbyObj, obj)) {
                        Collisions.collide(nearbyObj, obj, this._world);
                    }
                }
            }

        }

        // Update position for display engine -- do last.
        for (let obj of this._world.objectsIterator()) {
            if (obj.traits.has('displayable')) {

                this._world.notifyObjectMoved(obj);

                // Camera movement.
                obj.sprite.x -= -screenWidth / 4 + this._camera[0];
                obj.sprite.y -= -this._camera[1];
            }
        }

        // Control game state.
        this._gameOverseer.notifyEnd();
    }
}
