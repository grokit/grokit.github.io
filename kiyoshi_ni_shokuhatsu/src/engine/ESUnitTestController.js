// 
// Injects tests in the world, tearing up/down as they complete.
//
class ESUnitTestController extends EngineStepBase {
    constructor() {
        super();
        this._console = Factory.getConsole();

        this._testsToRun = [];
        this._started = false;
        this._finished = false;
        this._currentTest = null;
    }

    onBeginLoop() {
        if (this._currentTest != null) {
            this._currentTest.baseOnBeginLoop();
        }

        if (this._started == false) {
            this._console.info('Injecting set of unit-tests.');
            this._testsToRun = new UnitTests().getAll();
            this._started = true;
        }

        if (this._currentTest == null && this._testsToRun.length > 0) {
            this._currentTest = this._testsToRun.pop();
            this._currentTest.baseSetup();
        }

        if (this._currentTest != null) {
            if (this._currentTest.isDone()) {
                this._currentTest = null;
            }
        }
    }

    apply(obj) {
        if (this._currentTest != null) {
            this._currentTest.baseTick();
        }

        if (this._currentTest != null) {
            if (this._currentTest.isDone()) {
                this._currentTest = null;
            }
        }
    }

    onEndLoop() {
        if (this._currentTest != null) {
            this._currentTest.baseOnEndLoop();
        }

        if (!this._finished && this._currentTest == null && this._testsToRun.length == 0) {
            this._console.info('All unit-tests completed.');
            this._finished = true;
            return;
        }
    }
}