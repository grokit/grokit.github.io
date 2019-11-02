class Console {
    constructor() {
        this._objLink = null;
        // 0 is none.
        this._level = 4;

        this._badLog = 0;
        this._lastCall = 0;
        this._suppressAt = 2000;
    }

    _tick() {
        if (Date.now() - this._lastCall < 250) {
            this._badLog += 1;
        }

        this._lastCall = Date.now();

        if (this._badLog == this._suppressAt) {
            console.warn('Suppressing logs.');
        }

        if (this._badLog >= this._suppressAt) {
            return false;
        }

        return true;
    }

    _out(s) {
        let canPrint = this._tick();

        if (canPrint) {
            console.log(s);

            if (this._objLink != null) {
                this._objLink.setText(s);
            }
        }
    }

    linkToObject(obj) {
        if (!obj instanceof OBText) {
            throw new Error('Bad object instance: ' + obj.constructor.name);
        }
        this._objLink = obj;
    }

    trace(s) {
        if (this._level >= 5) {
            this._out('[TRAC] ' + s);
        }
    }

    debug(s) {
        if (this._level >= 4) {
            this._out('[DEBU] ' + s);
        }
    }

    info(s) {
        if (this._level >= 3) {
            this._out('[INFO] ' + s);
        }
    }

    log(s) {
        this.info(s);
    }

    warn(s) {
        if (this._level >= 2) {
            this._out('[WARN] ' + s);
        }
    }

    error(s) {
        if (this._level >= 1) {
            this._out('[ERRO] ' + s);
        }
    }

}