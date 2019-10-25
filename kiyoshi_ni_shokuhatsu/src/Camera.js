/**
# TODOs

## As

- Be able to lock such that not scroll before firstX item in level and not beyond lastX.
    - This will make it easier to deal with backgrounds.

- Move XY only if come up against 'edge' of screen -> less bouncy, especially for baseY.
*/
class Camera {

    constructor() {
        this._console = Factory.getConsole();

        this._x = 0;
        this._y = 0;

        // [minX, minY, maxX, maxY]
        // :::: get from level.
        this._levelBoundary = [0, 0, 10000, 10000];

        this._constants = Factory.getConstants();

        // width, heigh
        this._screen = [
            this._constants.logicalScreenSize()[0],
            this._constants.logicalScreenSize()[1]
        ];
    }

    getX() {
        return this._x;
    }

    getY() {
        return this._y;
    }

    // Will go towards target, but at a gradual speed.
    // Used for smooth transitions.
    _transferFunction(actual, target) {
        let speed = Math.min(4 / 10, Math.abs(actual - target) / 100);
        return actual + (target - actual) * speed;
    }

    notifyTrackedObject(obj, immediate = false) {
        if (this._levelBoundary.length != 4) {
            throw "bad boundary";
        }
        if (this._screen.length != 2) {
            throw "bad screen";
        }

        if (true) {
            // Camera doesn't center directly on object, or else it would
            // bet at bottom left of the screen.
            let offsetX = 6 * obj.width;
            // let offsetX = 0;

            // The x-pos is basically fixed at a specific point on the 
            // left side of the screen. This will not work well if we sometimes
            // have to go left (don't see far ahead).
            this._x = obj.x - offsetX;
        }

        if (true) {
            // The y-post should bias towards the ground, and for most of the
            // game, not move at all (unless we are almost reaching top of screen).
            let topBottomBars = 2 * this._constants.blockSize();
            let targetY = this.getY();

            let edgeYMax = this.getY() + this._screen[1] - topBottomBars;
            if (obj.y + obj.height > edgeYMax) {
                targetY = this.getY() + (obj.y + obj.height - edgeYMax);
            }

            let edgeYMin = this.getY() + topBottomBars * 2;
            if (edgeYMin >= edgeYMax) {
                throw "Camera edges mismatch.";
            }

            if (obj.y < edgeYMin) {
                targetY = this.getY() + (obj.y - edgeYMin);
            }

            //let targetY = obj.y - this._constants.blockSize() * 4;
            // this._console.info('camera tracking ' + obj.x + ', ' + obj.y);

            if (true) {
                if (!immediate) {
                    this._y = this._transferFunction(this.getY(), targetY);
                } else {
                    this._y = targetY;
                }
            }
        }

        // Camera cannot look outside of world boundaries.
        // This avoids camera showing "before" or "after" end of level.
        if (false) {
            this._x = Math.max(this._x, this._levelBoundary[0]);
            this._x = Math.min(this._x, this._levelBoundary[2] - this._screen[0]);
            this._y = Math.max(this._y, this._levelBoundary[1]);
            this._y = Math.min(this._y, this._levelBoundary[3] - this._screen[1] + this._constants.blockSize() * 2);
        }
    }
}