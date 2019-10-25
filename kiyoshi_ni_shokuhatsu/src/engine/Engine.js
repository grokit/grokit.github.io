class Engine {
    constructor() {
        this._time = 0;
        this._renderer = Factory.getRenderer();
        this._collisions = Factory.getCollisions();
        this._camera = Factory.getCamera();
        this._world = Factory.getWorld();
        this._console = Factory.getConsole();
        this._constants = Factory.getConstants();

        // This defines in-order, the steps applied to objects
        // for every engine tick.
        this._engineSteps = [];
        if (!this._constants.isUnitTests()) {
            this._engineSteps.push(new ESGameController());
        } else {
            this._engineSteps.push(new ESUnitTestController());
            this._console.info('Unit-tests inserted.');
        }
        this._engineSteps.push(new ESInput());
        this._engineSteps.push(new ESMain());
        this._engineSteps.push(new ESCamera());
    }

    getTime() {
        return this._time;
    }

    // Best to use only in test harness --
    // game logic is ALLOWED to depend on engine time.
    resetTime() {
        this._time = 0;
    }

    tick() {
        this._renderer.clear();

        // Engine steps on single objects.
        for (let engineStep of this._engineSteps) {
            engineStep.onBeginLoop();
        }

        let allObjects = null;
        if (true) {
            allObjects = Array.from(this._world.objectsIterator());
            if (this._time % 100 == 0) {
                this._console.trace('Number of object(s) in world: ' + allObjects.length);
            }
        } else {
            let margin = this._constants.blockSize() * 4;
            allObjects = this._world.select(
                this._camera.getX() - margin,
                this._camera.getY() - margin,
                this._constants.logicalScreenSize()[0] + margin,
                this._constants.logicalScreenSize()[1] + margin);
        }

        for (let obj of allObjects) {
            for (let engineStep of this._engineSteps) {
                engineStep.apply(obj);
            }
        }

        // Collisions.
        for (let obj of allObjects) {
            if (obj.traits.has('decoration')) {
                continue;
            }

            for (let nearbyObj of this._world.getNearbyObjects(obj)) {
                // Convention: current object is on LHS.
                if (nearbyObj != obj) {
                    if (this._collisions.isCollide(obj, nearbyObj)) {
                        this._collisions.onCollide(obj, nearbyObj);
                    }
                }
            }
        }

        for (let engineStep of this._engineSteps) {
            engineStep.onEndLoop();
        }

        if (true) {
            allObjects.sort(function(a, b) {
                a.zIndex = a.zIndex || 0;
                b.zIndex = b.zIndex || 0;
                return a.zIndex - b.zIndex
            });

            for (let obj of allObjects) {
                this._world.notifyObjectMoved(obj);
                this._renderer.draw(obj);
            }
        } else {
            let margin = this._constants.blockSize() * 4;

            let objectsInScreen = this._world.select(
                this._camera.getX() - margin,
                this._camera.getY() - margin,
                this._constants.logicalScreenSize()[0] + margin,
                this._constants.logicalScreenSize()[1] + margin);

            objectsInScreen.sort(function(a, b) {
                a.zIndex = a.zIndex || 0;
                b.zIndex = b.zIndex || 0;
                return a.zIndex - b.zIndex
            });

            for (let obj of objectsInScreen) {
                this._world.notifyObjectMoved(obj);
                this._renderer.draw(obj);
            }
        }

        this._time += 1;
    }
}