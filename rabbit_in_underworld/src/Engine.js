/**
# TODOs

## As
## Bs
## Cs

*/
class Engine {
    constructor(world, screenWidth, screenHeight) {
        this._world = world;

        this._screenWidth = screenWidth;
        this._screenHeight = screenHeight;

        this._time = Date.now() / 1000;
        this._camera = new Camera();
        this._camera.setScreen(screenWidth, screenHeight);
        this._input = new Set();
        this._fpsData = new Array();

        this._gameOverseer = new GameOverseer(this._world, this);
    }

    getScreenGeometry() {
        return [this._screenWidth, this._screenHeight];
    }

    getCamera() {
        return this._camera;
    }

    onKeyPress(ascii) {
        let o = ObjectFactory._input(ascii, 'up');
        for (let k of this._input) {
            if (k.key == o.key) {
                this._input.delete(k);
            }
        }
        this._input.add(o);
    }

    onKeyRelease(ascii) {
        let o = ObjectFactory._input(ascii, 'down');
        for (let k of this._input) {
            if (k.key == o.key) {
                this._input.delete(k);
            }
        }
        this._input.add(o);
    }

    forceFocusOnHero() {
        let objectsInScreen = this._world.objectsIterator();
        for (let obj of objectsInScreen) {
            if (obj.traits.has('hero')) {
                this._camera.notifyTrackedObject(obj, true);
            }
        }
    }

    notifyNextLevel() {
        this._gameOverseer.notifyNextLevel();
    }

    // Rely on this running at 60 FPS.
    onTime(timeInsecond) {
        if (Constants.isSlowDown()) {
            for (let i = 0; i < 2*1e8; ++i) {
                let y = i * i;
            }
        }

        let ds = timeInsecond - this._time;
        this._time = timeInsecond;

        //this._camera.setBoundary(this._world.getLevelBoundary());
        this._gameOverseer.notifyBegin();

        let margin = Constants.blockSize() * 6;
        let objectsInScreen = this._world.select(
            this._camera.getX() - margin,
            this._camera.getY() - margin,
            this.getScreenGeometry()[0] + 2 * margin,
            this.getScreenGeometry()[1] + 2 * margin);

        if (objectsInScreen.length == 0) {
            this.forceFocusOnHero();
            objectsInScreen = this._world.objectsIterator();
            console.log('forcing all');
        }

        for (let obj of objectsInScreen) {
            // Camera
            if (obj.traits.has('tracked_by_camera')) {
                this._camera.notifyTrackedObject(obj);
            }

            // Ticks trigger...
            this._gameOverseer.tick(obj);
            obj.tick();
            obj.traits.tick();

            // Remove objects out of ttl.
            if (obj.traits.has('engine_rm')) {
                this._world.deleteObject(obj);
            }

            if (obj.traits.has('controllable')) {
                for (let l of this._input) {
                    obj.input(l);
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
                let pullForce = 0.5;
                let friction = 0.1;

                if (obj.traits.has('on_surface')) {
                    friction *= 1.5;
                }

                // ::-: instead of having this, gravity override should be
                // in state which is associated with gravity.
                if (obj.traits.has('low_gravity')) {
                    pullForce /= 2.0;
                    friction /= 2.0;
                }

                // Left-right friction.
                let pos = obj.vx >= 0;
                if (!pos) obj.vx = -obj.vx;
                obj.vx = obj.vx - obj.vx * friction;
                if (!pos) obj.vx = -obj.vx;

                // Pull-down.
                if (!obj.traits.has('jumping')) {
                    obj.vy -= pullForce;

                    let vyMax = 10;
                    if (obj.vy < 0) {
                        obj.vy = Math.max(obj.vy, -vyMax);
                    } else {
                        obj.vy = Math.min(obj.vy, 1.5*vyMax);
                    }
                }
            }

            if (obj.traits.has('velocity')) {
                obj.x = obj.x + (obj.vx);
                obj.y = obj.y + (obj.vy);

                if (Math.abs(obj.vx) < 0.001) obj.vx = 0;
                if (Math.abs(obj.vy) < 0.001) obj.vy = 0;
            }

            // Kill objects that fall-off stage.
            if (obj.y <= -100) {
                obj.traits.set('kill', 0);
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
        for (let obj of objectsInScreen) {
            if (obj.traits.has('background')) {
                continue;
            }

            // Apply collisions; don't dedup so (l, r) then (r, l) will happen.
            for (let nearbyObj of this._world.getNearbyObjects(obj)) {
                if (nearbyObj.traits.has('background')) {
                    continue;
                }

                // Convention: current object is on RHS.
                if (nearbyObj != obj) {
                    if (Collisions.isCollide(nearbyObj, obj)) {
                        Collisions.collide(nearbyObj, obj, this._world, this);
                    }
                }
            }
        }

        // Update position for display engine -- do last.
        for (let obj of objectsInScreen) {
            //for (let obj of this._world.objectsIterator()) {
            this._world.notifyObjectMoved(obj);

            if (obj.traits.has('displayable')) {
                if (obj.traits.has('background_slow_scroll')) {
                    // We want the background to be at initial position as per
                    // the tile editor, so we preserve the first position. 
                    // Afterways, we just reduce the X-this._camera.getX().
                    //
                    if (isNaN(obj.initDisplacement)) {
                        obj.initDisplacement = this._camera.getX();
                    }

                    obj.sprite.x -= this._camera.getX() - 0.7 * (this._camera.getX() - obj.initDisplacement);
                } else {
                    obj.sprite.x -= this._camera.getX();
                }

                obj.sprite.y -= -this._camera.getY();
            }
        }

        // Control game state.
        this._gameOverseer.notifyEnd();
    }
}
