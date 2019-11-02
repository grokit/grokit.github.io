class ESInput extends EngineStepBase {
    constructor() {
        super();
        this._input = Factory.getInput();
        this._console = Factory.getConsole();
        this._keys = [];
    }

    onBeginLoop() {
        this._keys = this._input.getAndOnlyGetKeys();
    }

    onEndLoop() {
        // :::
        //this._input.clearKeysUp();
    }

    apply(obj) {
        for (let key of this._keys) {
            obj.baseOnKey(key);
        }
    }
}
