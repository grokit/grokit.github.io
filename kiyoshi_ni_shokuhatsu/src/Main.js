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

        // Need to do first: creates principal game components.
        Factory.setupNormal();

        // Load assets.
        await Factory.getAssetsList().loadAll();

        // Wire graphic engine.
        let canvas = document.getElementById('canvas_main');
        Factory.getRenderer().setAndInitializeCanvas(canvas);

        // Wire sound engine.
        let audio = document.createElement("audio");
        Factory.getGameAudio().setGameAudioDevice(audio);

        // Message to start the game.
        let message = new OBMessage();
        message.traits.addTrait(new TRPlayerDefeated());
        message.traits.get('TRPlayerDefeated').setAge(1000);
        Factory.getWorld().addObject(message);

        // Main game loop.
        let engine = Factory.getEngine();
        let loop = function() {
            engine.tick();
            requestAnimFrame(loop);
        }
        loop();
    }
}
