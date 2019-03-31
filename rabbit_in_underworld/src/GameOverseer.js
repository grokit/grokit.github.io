let priv_next_stack = new Array();

// Controls the state of the game, winning conditions, changing level, ...
class GameOverseer {
    constructor(world, engine) {
        this._world = world;
        this._engine = engine;

        this._nHeros = 0;
        this._nFramesWithoutHero = 0;
        this._levelNo = 0;
        this._pauseState = 0;
        this._nTick = 0;
        this._nextLevel = false;
    }

    // Called at beginning of engine iteration. Resets state for things
    // we want to know if / how happen during a single frame.
    notifyBegin() {
        this._nHeros = 0;
    }

    isPause() {
        return this._pauseState > 0;
    }

    notifyNextLevel() {
        this._nextLevel = true;
    }

    tick(obj) {
        this._nTick += 1;

        if (obj.traits.has('tracked_by_camera')) {
            this._nHeros += 1;
        }
    }

    _pickMusic(levelNo) {
        let tracks = AssetsList.listMusic();
        return tracks[levelNo % (tracks.length - 1)];
    }

    _clearLevelAndLoadNewOne(levelNo) {
        console.log('load level: ' + levelNo);
        this._world.clearLevelAndLoadNewOne(levelNo);
        Audio.stopAll();
        Audio.play(this._pickMusic(levelNo), 0.3, true);
    }

    notifyEnd() {
        if (this._nextLevel) {
            this._nextLevel = false;

            this._levelNo += 1;
            let transitionLen = 170;
            this._pauseState = transitionLen;
            this._clearLevelAndLoadNewOne(this._levelNo);
            Audio.stopAll();
            Audio.play('sounds/sfx/victory_victory.ogg', 0.5, false);

            for (let obj of this._world.objectsIterator()) {
                // This effectively freezes everything.
                // Those will get cleared in actual level loading.
                let isDisp = obj.traits.has('displayable');
                let isTracked = obj.traits.has('tracked_by_camera');
                obj.traits = new Traits();
                if (isDisp) {
                    obj.traits.add('displayable');
                }
                if (isTracked) {
                    obj.traits.add('tracked_by_camera');
                }
            }

            let ix = this._engine.getCamera().getX();
            let iy = this._engine.getCamera().getY();

            let forSize = this._world.getFactory().buildFromName("gfx/block_level_transition.png");
            let width = forSize.width;
            let height = forSize.height;

            for (let posX = ix; posX <= ix + this._engine.getScreenGeometry()[0]; posX += width) {
                for (let posY = iy; posY <= iy + this._engine.getScreenGeometry()[1]; posY += height) {
                    let block = this._world.getFactory().buildFromName("gfx/block_level_transition.png");
                    block.x = posX;
                    block.y = posY;

                    let elen = Math.floor(0.25 * transitionLen + 0.70 * transitionLen * Math.random());
                    block.traits.set('kill', elen);
                    this._world.addObject(block);
                }
            }
            return;
        }

        if (this._pauseState >= 1) {
            this._pauseState -= 1;
        }

        if (this._pauseState == 1) {
            this._clearLevelAndLoadNewOne(this._levelNo);
        } else if (this._nTick == 0) {
            // Initial state. Load level.
            console.log('ntick 0');
            this._clearLevelAndLoadNewOne(this._levelNo);
        } else if (this._nHeros == 0) {
            console.log('nhero 0');
            this._nFramesWithoutHero += 1;
            if (this._nFramesWithoutHero == 120) {
                this._nFramesWithoutHero = 0;
                this._clearLevelAndLoadNewOne(this._levelNo);
            }
        }

        this._nHeros = 0;
    }
}
