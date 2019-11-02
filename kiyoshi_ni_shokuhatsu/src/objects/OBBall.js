class OBBall extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this.loadImage("OBBall.png");
        this.traits.addTraitGeneric('friction');
        this.traits.addTraitGeneric('gravity');
        this.traits.addTraitGeneric('ball');
    }

    tick() {
    }

    onCollide(){
        let overlap = this._world.select(this.x, this.y, this.width, this.height);
        for (let obj of overlap) {
            if (obj.traits.has('surface')) {
                this._collisions.applyLROUCollision(this, obj);
                this.traits.addTraitGeneric('on_surface', 1);
            }

            if (!obj.traits.has('decoration') && !obj.traits.has('surface')) {
                let vec = this._collisions.vectToCenter(this, obj);
                this.vx -= vec.x;
                this.vy -= vec.y;
            }
        }
    }
}
