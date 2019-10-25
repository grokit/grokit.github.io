class OBSpikeCeilingFalling extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this.traits.addTraitGeneric('lethal');
    }

    tick() {
        let overlap = this._world.select(this.x, this.y - 8 * this.height, this.width, 8 * this.height);
        for (let ob of overlap) {
            if (ob.traits.has('hero')) {
                this.traits.addTraitGeneric('gravity');
            }
        }
    }
}