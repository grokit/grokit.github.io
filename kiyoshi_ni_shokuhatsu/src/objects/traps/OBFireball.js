class OBFireball extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this.loadImage("OBFireball.png");
        this.traits.addTraitGeneric('lethal', -1);
        this.traits.addTraitGeneric('stick_to_surface');
    }

    tick() {
        let overlap = this._world.select(this.x, this.y, this.width, this.height);
        for (let ob of overlap) {
            if (ob.traits.has('surface')) {
                this._collisions.applyLROUCollision(this, ob);
            }
        }
    }
}