//
// Use as static Factory to:
//  - Tie-up objects without requiring long constructor chains.
//  - Provide basic dependency injection.
//
// Downsides:
//  - Have to consider order.
//  - Limits those objects to only one, code more opaque.
//
class Factory {
    static setupNormal() {
        // Need to form a DAG. Consider order.
        _instance.permanentState = new PermanentState();
        _instance.console = new Console();
        _instance.constants = new Constants();
        _instance.collisions = new Collisions();
        _instance.assetsList = new AssetsList();
        _instance.objectFactory = new ObjectFactory();
        _instance.levels = new Levels();
        _instance.camera = new Camera();
        _instance.gameAudio = new GameAudio();
        _instance.input = new Input();
        _instance.renderer = new CanvasRenderer();
        _instance.world = new World();
        _instance.engine = new Engine();
    }

    static getPermanentState() {
        return _instance.permanentState;
    }

    static getCamera() {
        return _instance.camera;
    }

    static getObjectFactory() {
        return _instance.objectFactory;
    }

    static getAssetsList() {
        return _instance.assetsList;
    }

    static getGameAudio() {
        return _instance.gameAudio;
    }

    static getConsole() {
        return _instance.console;
    }

    static getInput() {
        return _instance.input;
    }

    static getLevels() {
        return _instance.levels;
    }

    static getEngine() {
        return _instance.engine;
    }

    static getConstants() {
        return _instance.constants;
    }

    static getRenderer() {
        return _instance.renderer;
    }

    static getWorld() {
        return _instance.world;
    }

    static getCollisions() {
        return _instance.collisions;
    }
}

const _instance = new Factory();
