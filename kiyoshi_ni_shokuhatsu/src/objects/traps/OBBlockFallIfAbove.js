class OBBlockFallIfAbove extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this.traits.addTraitGeneric('surface');
        this._time = 0;
    }

    tick() {
        // Disguise as another block.
        if (this._time == 0) {
            this.loadImage('block_falling_yellow.png');
        }

        let overlap = this._world.select(this.x, this.y, this.width, 6 * this.height);
        for (let ob of overlap) {
            if (ob.traits.has('hero')) {
                this.traits.addTraitGeneric('gravity');
                this.vy = -8;
            }
        }

        this._time += 1;
    }
}