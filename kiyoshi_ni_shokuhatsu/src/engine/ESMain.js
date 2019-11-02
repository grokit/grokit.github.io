/**
 * Main actions that should apply to all game modes,
 * bundled together.
 */
class ESMain extends EngineStepBase {

    constructor() {
        super();
        this._world = Factory.getWorld();
        this._console = Factory.getConsole();
        this._constants = Factory.getConstants();
    }

    apply(obj) {
        // Tick.
        obj.baseTick();

        // Gravity
        //
        // y+
        // ^
        // |
        // |
        // -----> x+
        if (obj.traits.has('gravity')) {
            let pullForce = 0.15;
            obj.vy -= pullForce;

            let vyMax = 100;
            if (obj.vy < 0) {
                obj.vy = Math.max(obj.vy, -vyMax);
            } else {
                obj.vy = Math.min(obj.vy, vyMax);
            }
        }

        // Left-right friction.
        if (obj.traits.has('friction')) {
            let friction = 0.07;

            if (obj.traits.has('jumping')) {
                friction *= 0.2;
            }

            let pos = obj.vx >= 0;
            if (!pos) obj.vx = -obj.vx;
            obj.vx = obj.vx - friction;
            if (obj.vx < 0) obj.vx = 0;
            if (!pos) obj.vx = -obj.vx;
        }

        // Velocity
        if (obj.traits.has('moveable')) {
            obj.x = obj.x + (obj.vx);
            obj.y = obj.y + (obj.vy);

            if (Math.abs(obj.vx) < 0.001) obj.vx = 0;
            if (Math.abs(obj.vy) < 0.001) obj.vy = 0;
        }
    }
}
