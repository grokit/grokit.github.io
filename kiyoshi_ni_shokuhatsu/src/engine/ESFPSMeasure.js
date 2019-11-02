class ESFPSMeasure extends EngineStepBase {

    constructor() {
        super();
        this._console = Factory.getConsole();
        this._nFrame = 0;
        this._sampleLen = 100;
        this._timeMs = Date.now();
    }

    onBeginLoop() {
        this._nFrame += 1;

        if (this._nFrame == this._sampleLen) {
            let fps = 1000 * this._sampleLen / (Date.now() - this._timeMs);
            this._console.info('FPS: ' + fps);

            this._nFrame = 0;
            this._timeMs = Date.now();
        }
    }

    onEndLoop() {}

    apply(obj) {}
}