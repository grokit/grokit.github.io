class OBSpikeCeilingFalling extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this.traits.addTraitGeneric('lethal_bottom');
    }

    tick() {}

    onCollide() {
        let overlap = this._world.select(this.x, this.y - 8 * this.height, this.width, 8 * this.height);
        for (let obj of overlap) {
            if (obj.traits.has('hero')) {
                this.traits.addTraitGeneric('gravity');
            }
        }

        let coll = this._world.collideWith(this);
        for (let obj of coll) {
            if (obj.traits.has('surface')) {
                this._collisions.applyLROUCollision(this, obj);
            }
        }
    }
}