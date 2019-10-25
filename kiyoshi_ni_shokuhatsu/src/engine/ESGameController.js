class ESGameController extends EngineStepBase {
    constructor() {
        super();
        this._console = Factory.getConsole();
        this._nObjs = 0;

        this._world = Factory.getWorld();
        this._levels = Factory.getLevels();
    }

    onBeginLoop() {
        this._nObjs = 0;
    }

    apply(obj) {
        this._nObjs += 1;
    }

    onEndLoop() {
        if (this._nObjs == 0) {
            //this._levels.loadLevelFromAssetName('level_00.json', this._world);
            this._levels.loadLevelFromAssetName('earthquake_building.json', this._world);
        }
    }
}