let type = "WebGL"
if (!PIXI.utils.isWebGLSupported()) {
    console.warn('WebGL not supported')
    type = "canvas"
}

let zoomLevel = 1.0;
//var autoScreenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
//let screenWidth = autoScreenWidth;
//let screenWidth = 1200 / zoomLevel;
//let screenHeight = 800 / zoomLevel;
let screenWidth = 800 / zoomLevel;
let screenHeight = 600 / zoomLevel;
//let screenWidth = 640 / zoomLevel;
//let screenHeight = 480 / zoomLevel;

var app = new PIXI.Application(screenWidth, screenHeight, {
    antialias: true,
    autoStart: false,
    resolution: zoomLevel,
    //backgroundColor: 0x66c2ff,
    backgroundColor: 0x0,
});

var canvas = document.getElementById('gamespace');
canvas.appendChild(app.view);

// Pre-load all gfx.
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
                fill: 0x0,
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

    applyZIndices() {
        // Objects added dynamically will just appear at
        // the end of the z-order.
        this._stage.children.sort(function(a, b) {
            a.zIndex = a.zIndex || 0;
            b.zIndex = b.zIndex || 0;
            return a.zIndex - b.zIndex
        });
    }

    notifyObjectMoved(object) {
        object.sprite.x = object.x;
        // Y is up, starting at 0 at bottom-left corner.
        // Since PIXY coordinates system is different, do adaptation here.
        object.sprite.y = -object.y + this._app.renderer.screen.height - object.sprite.height;
        object.sprite.zIndex = object.zIndex;
    }

    deleteObject(object) {
        this._stage.removeChild(object.sprite);
    }

    clearAll() {
        this._stage.removeChildren();
    }
}

function onGfxLoaded() {
    // Stage is the object that PIXI goes through and renders.
    let stage = app.stage;

    let world = new World();
    let objectFactory = new ObjectFactory(world);
    world.setObjectFactory(objectFactory);

    // Load level in engine.
    let levels = new Array();

    // Future: list from assets
    //levels.push(PIXI.loader.resources['levels/l_exp.json'].data);
    levels.push(PIXI.loader.resources['levels/l_00_rabbit_in_house.json'].data);
    levels.push(PIXI.loader.resources['levels/l_01.json'].data);
    levels.push(PIXI.loader.resources['levels/l_02.json'].data);
    levels.push(PIXI.loader.resources['levels/l_03.json'].data);
    levels.push(PIXI.loader.resources['levels/l_04.json'].data);
    levels.push(PIXI.loader.resources['levels/l_05.json'].data);
    levels.push(PIXI.loader.resources['levels/l_99_rabbit_in_safe_house.json'].data);
    world.setLevels(levels);

    // Add link from world to rendered, such that in-engine
    // code does not deal with internals of Pixi.js.
    world.setRendererNotify(new RendererProxy(app, stage));

    let engine = new Engine(world, screenWidth, screenHeight);

    // Setup input (keyboard) to engine events.
    Input.wireEngine(engine);

    let frameCount = 0;
    let closureGameLoop = function() {
        if (1 || frameCount < 64) {
            requestAnimationFrame(closureGameLoop);
            gameLoop(engine, stage);
        }

        frameCount += 1;
    }

    closureGameLoop();
}

let engineSpeed = new Array();

function gameLoop(engine, stage) {

    let beforeEngine = Date.now();
    engine.onTime(Date.now() / 1000);

    // If engine was the only thing to compute, how many FPS
    // would we get.
    if (Constants.isMeasureFPS()) {
        let fps = 1.0 / ((Date.now() - beforeEngine) / 1000.0);
        engineSpeed.push(fps);
        if (engineSpeed.length > 60 * 5) {
            let t = 0;
            for (let i = 0; i < engineSpeed.length; ++i) {
                t += engineSpeed[i];
            }
            t /= engineSpeed.length;
            Console.debug('EngineSpeed: ' + t);
            engineSpeed = new Array();
        }
    }

    app.renderer.render(stage);
}

if (Constants.isMusic()) {
    Audio.play('sfx/starling_full_mod.ogg', 0.5, true);
}
