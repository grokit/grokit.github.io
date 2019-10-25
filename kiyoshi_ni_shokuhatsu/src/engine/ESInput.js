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

    onEndLoop() {}

    apply(obj) {
        if (obj.traits.has('controllable')) {
            let control = obj.traits.get('controllable');
            for (let key of this._keys) {
                this._console.trace('onKey ' + key.action + ' on object ' + obj.id + ' of type ' + obj.constructor.name);
                control.onKey(key, obj);
            }
        }
    }
}