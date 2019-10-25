class ESCamera extends EngineStepBase {

    constructor() {
        super();
        this._camera = Factory.getCamera();
        this._console = Factory.getConsole();
    }

    onBeginLoop() {
        this._nTrack = 0;
    }

    apply(obj) {
        if (obj.traits.has('hero')) {
            this._camera.notifyTrackedObject(obj);
            this._nTrack += 1;
        }
    }

    onEndLoop() {
        if (this._nTrack != 1) {
            this._console.trace('ESCamera tracking ' + this._nTrack + ' object(s).');
        }
    }

}