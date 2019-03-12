/**
# TODOs

## As

- Be able to lock such that not scroll before firstX item in level and not beyond lastX.
    - This will make it easier to deal with backgrounds.

- Move XY only if come up against 'edge' of screen -> less bouncy, especially for baseY.
*/
class Camera {

    constructor() {
        this._x = 0;
        this._y = 0;
        // ::: err--- that should come from engine.
        this._baseY = 4 * 64;
        // ... this too
        this._offsetX = 3 * 64;

        // minX, minY, maxX, maxY
        // this._dimensions = [0, 0, 0, 0];
        // ^^ should come from level, since don't want dynamic here...
    }

    getX() {
        return this._x;
    }

    getY() {
        return this._y;
    }

    notifyTrackedObject(obj) {
        this._x = obj.x - this._offsetX;

        let target = Math.max(this._baseY, obj.y - this._baseY);

        // --> Math.max ?
        let speed = 1 / 10 + Math.min(4 / 10, Math.abs(this.getY() - target) / 100);

        this._y -= (this.getY() - target) * speed;
    }
}
