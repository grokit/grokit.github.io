//
// Game bootstrapping, including canvas-related.
// 
class Main {
    async start() {
        window.requestAnimFrame =
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };

        // Need to do first: creates all principal game components.
        Factory.setupNormal();

        // Load all assets.
        await Factory.getAssetsList().loadAll();

        // Wire graphic engine.
        let canvas = document.getElementById('canvas_main');
        let constants = Factory.getConstants();
        canvas.width = constants.logicalScreenSize()[0] * constants.zoomLevel();
        canvas.height = constants.logicalScreenSize()[1] * constants.zoomLevel();
        Factory.getRenderer().setCanvas(canvas);

        // Wire sound engine.
        let audio = document.createElement("audio");
        Factory.getGameAudio().setGameAudioDevice(audio);

        // Main game loop.
        let engine = Factory.getEngine();
        let loop = function() {
            engine.tick();
            requestAnimFrame(loop);
        }
        loop();
    }
}