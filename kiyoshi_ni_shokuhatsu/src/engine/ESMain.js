/**
 * Main actions that should apply to all game modes,
 * bundled together.
 */
class ESMain extends EngineStepBase {

    constructor() {
        super();
        this._world = Factory.getWorld();
        this._console = Factory.getConsole();
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
            let friction = 0.1;

            let pos = obj.vx >= 0;
            if (!pos) obj.vx = -obj.vx;
            obj.vx = obj.vx - obj.vx * friction;
            if (!pos) obj.vx = -obj.vx;

        }

        // Velocity
        if (obj.traits.has('moveable')) {
            obj.x = obj.x + (obj.vx);
            obj.y = obj.y + (obj.vy);

            if (Math.abs(obj.vx) < 0.001) obj.vx = 0;
            if (Math.abs(obj.vy) < 0.001) obj.vy = 0;
        }

        // Kill objects that fall-off stage.
        if (obj.y <= -100) {
            this._console.trace('Object falling off-stage: ' + obj.name());
            obj.traits.addTraitGeneric('kill', 0);
        }

        // Remove objects out of kill.
        if (obj.traits.has('kill')) {
            let trait = obj.traits.get('kill');
            if (trait.ttl == 0) {
                this._console.trace('Object getting removed because `kill` trait out of TTL: ' + obj.name());
                obj.onKillBase();
                this._world.deleteObject(obj);
            } else if (trait.kill < 0) {
                throw new Error("Invalid ttl: " + trait.ttl);
            }
        }
    }
}