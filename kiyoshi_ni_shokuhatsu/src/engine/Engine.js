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

        this._engineSteps.push(new ESFPSMeasure());
        this._engineSteps.push(new ESInput());
        this._engineSteps.push(new ESMain());
        this._engineSteps.push(new ESGarbageCollect());
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

    _listObjects() {
        // Depending on level logic, can operate on all objects
        // or only on what is in field of view.
        let allObjects = null;
        if (true) {
            allObjects = Array.from(this._world.objectsIterator());
        } else {
            let margin = this._constants.blockSize() * 10;
            allObjects = this._world.select(
                this._camera.getX() - margin,
                this._camera.getY() - margin,
                this._constants.logicalScreenSize()[0] + margin,
                this._constants.logicalScreenSize()[1] + margin);
        }

        return allObjects;
    }

    tick() {
        this._renderer.clear();

        // Engine steps on single objects.
        for (let engineStep of this._engineSteps) {
            engineStep.onBeginLoop();
        }

        let allObjects = this._listObjects();

        // For later display, sort on z-axis.
        //
        // Processing objects in the same order through 
        // stable-sort also diminishes non-reproducible effects.
        allObjects.sort(function(a, b) {
            if (a.zIndex == null) throw new Error("Object missing zIndex.");
            if (b.zIndex == null) throw new Error("Object missing zIndex.");
            let az = a.zIndex + 1 / (a.id + 2);
            let bz = b.zIndex + 1 / (b.id + 2);
            return az - bz;
        });

        for (let obj of allObjects) {
            for (let engineStep of this._engineSteps) {
                engineStep.apply(obj);
            }
        }

        for (let obj of allObjects) {
            obj.baseOnCollide();
        }

        for (let obj of allObjects) {
            this._world.notifyObjectMoved(obj);
            this._renderer.draw(obj);
        }

        // Needs to be done at the END such that wiping
        // world (ESGameController) does not mess with 
        // current iterator.
        for (let engineStep of this._engineSteps) {
            engineStep.onEndLoop();
        }

        this._time += 1;
    }
}