class UTMeasureFPSWithBalls extends UnitTestsBase {
    constructor() {
        super();
    }

    setup() {
        let levels = Factory.getLevels();
        let level = levels.loadLevelFromAssetName('ut_measure_fps_with_balls.json');
        Utils.setupLevelObjectInWorld(level, this._world, this._camera);
        this._beginTimesMs = Date.now();
    }

    onBeginLoop() {
        let engineTime = this._engine.getTime();
        if (engineTime == 100) {
            let elapsedMs = Date.now() - this._beginTimesMs;
            let fps = 1000 * engineTime / elapsedMs;
            this._console.info('Running at ' + fps + 'fps.');
            if (fps < 40) {
                throw new Error('Game is too slow.');
            }
            this._isDone = true;
        }
    }
}