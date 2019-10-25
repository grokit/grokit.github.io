class GameObjectBase {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        // zIndex maps to layerId, 0 is the most background possible, "behind".
        // Range of [0..100]
        this.zIndex = 50;
        this.width = 0;
        this.height = 0;
        this.flippedHorizontally = false;
        this.flippedVertically = false;

        this.vx = 0;
        this.vy = 0;

        this.image = null;
        this._lastImageLoaded = '';
        this.text = null;

        // Files mapping to this object.
        // This is how we associate something.png to creating
        // an in-game object.
        this._filesMappingToThis = new Set();
        this._filesMappingToThis.add(this.name() + '.png');

        this.traits = new Traits();
        this.traits.addTraitGeneric('moveable', -1);

        this._console = Factory.getConsole();
        this._consants = Factory.getConstants();
        this._assetsList = Factory.getAssetsList();
        this._world = Factory.getWorld();
        this._collisions = Factory.getCollisions();

        this.id = _gameObjectBase_objId;
        _gameObjectBase_objId += 1;
    }

    name() {
        return this.constructor.name;
    }

    filenameMappingToThis() {
        return this._filesMappingToThis;
    }

    onKillBase() {
        this.onKill();
    }

    onKill() {}

    loadImage(filename) {
        if (this._lastImageLoaded == filename) {
            return;
        }
        this._lastImageLoaded = filename;

        this.image = this._assetsList.get(filename);

        this.width = this.image.width;
        this.height = this.image.height;
    }

    onKey(key) {}

    baseTick() {
        // Not need to *baseTick()* on traits since this
        // is the collection object.
        this.traits.tick();
        this.tick();
    }

    tick() {
        throw new Error("Leave empty for child to overload.");
    }
}

// ::: move in Factory ... have some sort of object for this?
let _gameObjectBase_objId = 0;