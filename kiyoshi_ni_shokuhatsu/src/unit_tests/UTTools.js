class UTTools extends UnitTestsBase {
    constructor() {
        super();
    }

    setup() {}

    // ::: finish
    tick() {
        let res = 0;

        this._ca = new CircularAverage(1000);
        res = this._ca.avg();
        this._console.info('Avg of no vals: ' + res);
        if (!Number.isNaN(res)) {
            throw new Error();
        }

        this._ca.notify(1);
        if (res == 1) {
            throw new Error();
        }

        this._ca.notify(0);
        if (res == 0.5) {
            throw new Error();
        }

        this._ca = new CircularAverage(3);
        this._ca.notify(1);
        this._ca.notify(1);
        this._ca.notify(1);

        this._isDone = true;
    }
}