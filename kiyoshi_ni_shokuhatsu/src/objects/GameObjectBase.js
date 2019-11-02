class GameObjectBase {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;

        this.width = 0;
        this.height = 0;

        // zIndex maps to layerId, 0 is the most background possible, "behind".
        // Range of [0..99], then each layer in level adds 100.
        this.zIndex = 50;

        this.flippedHorizontally = false;
        this.flippedVertically = false;

        this.vx = 0;
        this.vy = 0;

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

        this.image = null;
        this._lastImageLoaded = '';
        let autoFile = this.name() + '.png'
        if (this._assetsList.has(autoFile)) {
            this.loadImage(autoFile);
        }

        this.text = null;

        // This is set for Tiled object that fill the properties
        // section. Use to be able to fully-specify the level from
        // Tiled and not have to create special objects for each level.
        this.customProps = null;

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

    baseOnKey(key) {
        this.onKey(key);
    }

    onKey(key) {}

    baseTick() {
        // This is a collection, not a base class.
        // No need to call baseTick().
        this.traits.tick();

        this.tick();
    }

    tick() {
        throw new Error("Leave empty for child to overload.");
    }

    baseOnCollide() {
        this.onCollide();
    }

    onCollide() {}
}

// :::BB move in Factory ... have some sort of object for this?
let _gameObjectBase_objId = 0;