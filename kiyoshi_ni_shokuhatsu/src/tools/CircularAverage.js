class CircularAverage {
    constructor(size = 1000) {
        this._size = size;
        this._b = [];
        this._i = 0;
    }

    notify(v) {
        if (this._b.length < this._size) {
            this._b.push(v);
        } else {
            this._b[this._i] = v;
            this._i += 1;
            this._i = this._i % this._size;
        }
    }

    // Returns `NaN` if no sample.
    avg() {
        let t = 0;
        for (let i = 0; i < this._b.length; ++i) {
            t += this._b[i];
        }

        return t / this._b.lentgh;
    }
}