// Controls the state of the game, winning conditions, changing level, ...
class GameOverseer {
    constructor(world) {
        this._world = world;
        this._nHeros = 0;
        this._nSplash = 0;
        this._levelNo = 0;
    }

    notifyBegin() {
        this._nHeros = 0;
        this._nSplash = 0;
    }

    tick(obj) {
        if (obj.traits.has('hero')) {
            this._nHeros += 1;
        }

        if (obj.traits.has('splash')) {
            this._nSplash += 1;
            if (obj.next) {
                let nobj = this._world.getFactory().buildGameStateObject('next_level', -1);
                this._world.addObject(nobj);
            }
        }

        if (obj.traits.has('game_state')) {
            if (obj.action == 'next_level') {
                this._levelNo += 1;
                this._world.loadLevel(this._levelNo);
            } else if (obj.action == 'change_level') {
                this._world.loadLevel(obj.data);
            } else {
                throw "unknown action: " + obj.action;
            }
        }
    }

    notifyEnd() {
        if (this._nSplash >= 1) {
            // nop
        } else if (this._nHeros == 0) {
            this._world.loadLevel(this._levelNo);
        }

        this._nHeros = 0;
    }
}