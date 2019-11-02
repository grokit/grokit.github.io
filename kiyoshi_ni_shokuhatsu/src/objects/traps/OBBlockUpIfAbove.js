class OBBlockUpIfAbove extends GameObjectBase {
    constructor(x, y) {
        super(x, y);

        this.traits.addTraitGeneric('surface');
        this._time = 0;
        this._triggered = false;

        // ... like other surfaces.
        this.zIndex = 35;
    }

    tick() {
        // Disguise as another block.
        if (this._time == 0) {
            this.loadImage('block_falling_yellow.png');
        }


        this._time += 1;
    }

    onCollide() {
        let overlap = this._world.select(this.x, this.y, this.width, 2 * this.height, this);
        for (let obj of overlap) {

            if (!this._triggered && obj.traits.has('hero') && obj.y > this.y + this.height) {
                this.vy = 2;
                this._triggered = true;
            }

        }

        overlap = this._world.collideWith(this);
        for (let obj of overlap) {
            if (obj.traits.has('surface')) {
                this._collisions.applyLROUCollision(this, obj);
            }
        }
    }
}