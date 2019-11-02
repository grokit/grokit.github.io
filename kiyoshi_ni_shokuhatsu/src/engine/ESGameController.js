class ESGameController extends EngineStepBase {
    constructor() {
        super();
        this._console = Factory.getConsole();
        this._world = Factory.getWorld();
        this._levels = Factory.getLevels();
        this._camera = Factory.getCamera();
        this._permanentState = Factory.getPermanentState();

        this._nHeros = 0;

        this._locationsStack = new Array();
        this._locationsStack.push(this._constants.startLevelFilename());

        this._endLoopActions = new Array();
    }

    onBeginLoop() {
        this._nHeros = 0;
    }

    apply(obj) {
        if (obj.traits.has('TRPlayerDefeated')) {
            let age = obj.traits.get('TRPlayerDefeated').getAge();
            if (age >= this._constants.transitionTimeMs() / 60 ) {
                let th = this;
                this._endLoopActions.push(function() {
                    th._travelToRestartLevel();
                });
            }
        }

        if (obj.traits.has('TRTravelToLevel')) {
            let th = this;
            this._endLoopActions.push(function() {
                th._travelTo(obj.traits.get('TRTravelToLevel').levelFilename);
            });
        }

        if (obj.traits.has('hero')) {
            this._nHeros += 1;
        }
    }

    _resetWorldIntoNextLevel() {
        if (this._locationsStack.length == 0) {
            throw new Error("Game observer does not know where next.");
        }

        let levelFilename = this._locationsStack.pop();
        this._locationsStack.push(levelFilename);

        let level = this._levels.loadLevelFromAssetName(levelFilename);
        Utils.setupLevelObjectInWorld(level, this._world, this._camera);
        this._currentLevel = level;
    }

    _travelTo(levelFilename) {
        this._console.trace('_travelTo()');

        this._locationsStack.pop();
        this._locationsStack.push(levelFilename);
        this._resetWorldIntoNextLevel();
    }

    _travelToRestartLevel() {
        this._console.trace('_travelToRestartLevel()');

        if (this._locationsStack.length == 0) {
            throw new Error("Game observer does not know where next.");
        }

        let levelFilename = this._locationsStack.pop();
        if(levelFilename != 'reincarnation.json'){
            // Go to reincarnation, then come back to this level.
            this._locationsStack.push(levelFilename);
            this._locationsStack.push('reincarnation.json');
            this._permanentState.nLives -= 1;
        }else{
            // We are currently in reincarnation.json, next go into
            // the level that was there before.
        }

        if(this._permanentState.nLives < 0){
            this._locationsStack.push('game_over.json');
        }

        this._resetWorldIntoNextLevel();
    }

    onEndLoop() {
        let acts = this._endLoopActions;
        this._endLoopActions = new Array();
        for (let act of acts) {
            act();
        }
    }
}
