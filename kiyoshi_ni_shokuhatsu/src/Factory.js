//
// Use as static Factory to:
//  - Tie-up objects without requiring long constructor chains.
//  - Provide basic dependency injection.
//
class Factory {
    static setupNormal() {
        // Need to form a DAG. Consider order.
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

        // Custom post-creation setup.
        // doesn't work given that we reset the world...
        // .... need to put in hud-like code.
        if (false) {
            let consoleText = new OBText(0, 0, 'Console init...');
            consoleText.setColor('#055fad');
            consoleText.setSize(5);
            Factory.getWorld().addObject(consoleText);
            Factory.getConsole().linkToObject(consoleText);
        }
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