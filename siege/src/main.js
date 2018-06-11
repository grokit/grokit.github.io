let type = "WebGL"
if (!PIXI.utils.isWebGLSupported()) {
    console.warn('WebGL not supported')
    type = "canvas"
}

let screenWidth = 1200;
let screenHeight = 800;
//let screenHeight = 600;

var app = new PIXI.Application(screenWidth, screenHeight, {
    antialias: false,
    resolution: 1,
    backgroundColor: 0x0,
});

document.body.appendChild(app.view);

// Pre-load all resources
// https://github.com/englercj/resource-loader
PIXI.loader
    .add(AssetsList.list())
    .on("progress", onGfxLoadProgress)
    .load(onGfxLoaded);

function onGfxLoadProgress(loader, resource) {
    if (false) {
        console.log("Loading: " + resource.url);
        console.log("Progress: " + loader.progress + "%");
    }
}

// We don't want dependency on engine-specific (PIXI) code in other
// modules. We use this proxy to invert dependency: the main engine
// call those notification functions which PIXI need to display.
class RendererProxy {
    constructor(app, stage) {
        this._stage = stage;
        this._app = app;
    }

    addObject(object) {
        if (object.traits.has('text')) {
            object.sprite = new PIXI.Text(object.text, {
                fontFamily: 'Arial',
                fontSize: object.size,
                fill: 0xffffff,
                align: 'center'
            });
        } else {
            object.sprite = new PIXI.Sprite(PIXI.loader.resources[object.image].texture);
            object.height = object.sprite.texture.height;
            object.width = object.sprite.texture.width;
        }

        this.notifyObjectMoved(object);
        this._stage.addChild(object.sprite);
    }

    notifyObjectMoved(object) {
        object.sprite.x = object.x;
        object.sprite.y = -object.y + this._app.renderer.screen.height - object.sprite.height;
        object.sprite.zIndex = object.zIndex;
    }

    deleteObject(object) {
        this._stage.removeChild(object.sprite);
    }
}

function onGfxLoaded() {
    // Stage is the object that PIXI goes through and renders.
    let stage = app.stage;

    let world = new World();
    loadLevel(world, stage);

    let engine = new Engine();
    engine.setWorld(world);

    // Setup input (keyboard) to engine events.
    Input.wireEngine(engine);

    // Objects added dynamically will just appear at
    // the end of the z-order.
    stage.children.sort(function(a, b) {
        a.zIndex = a.zIndex || 0;
        b.zIndex = b.zIndex || 0;
        return b.zIndex - a.zIndex
    });

    app.ticker.add(function() {
        gameLoop(engine, stage);
    });
}

function loadLevel(world, stage) {
    // Load level in engine.
    let level = PIXI.loader.resources['levels/l_00.json'];
    level = level.data;
    let objects = Level.load(level);

    // Add link from world to rendered, then put all objects 
    // in world.
    world.setRendererNotify(new RendererProxy(app, stage));
    for (let object of objects) {
        world.addObject(object);
    }
}

let engineSpeed = new Array();

function gameLoop(engine, stage) {

    let beforeEngine = Date.now();
    engine.onTime(Date.now() / 1000);

    // If engine was the only thing to compute, how many FPS
    // would we get.
    if (true) {
        let fps = 1.0 / ((Date.now() - beforeEngine) / 1000.0);
        engineSpeed.push(fps);
        if (engineSpeed.length > 60 * 5) {
            let t = 0;
            for (let i = 0; i < engineSpeed.length; ++i) {
                t += engineSpeed[i];
            }
            t /= engineSpeed.length;
            console.log('EngineSpeed: ' + t);
            engineSpeed = new Array();
        }
    }

    app.renderer.render(stage);
}
