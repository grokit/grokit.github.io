class ESInput extends EngineStepBase {
    constructor() {
        super();
        this._input = Factory.getInput();
        this._console = Factory.getConsole();
        this._keys = [];
    }

    onBeginLoop() {
        this._keys = this._input.getKeysOncePerTick();
    }

    onEndLoop() {
    }

    apply(obj) {
        for (let key of this._keys) {
            obj.baseOnKey(key);
        }
    }
}
