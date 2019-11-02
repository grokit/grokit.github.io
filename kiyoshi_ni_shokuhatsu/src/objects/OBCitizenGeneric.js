class OBCitizenGeneric extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        //this.traits.addTraitGeneric('friction');
        this.traits.addTraitGeneric('gravity');
        this.traits.addTraitGeneric('monster');
        this.traits.addTraitGeneric('stick_to_surface');
        this.zIndex = 90;

        this._dir = 1;
    }

    tick() {
        if (this.traits.has('immobile')) {} else {
            if (Math.abs(this.vx) == 0) {
                this.vx += this._dir;
                if (this.vx > 0) {
                    this.flippedHorizontally = false;
                } else {
                    this.flippedHorizontally = true;
                }

                if (Math.floor(Math.random() * 101) < 20) {
                    this.vy += 1 + Math.random() * 3;
                }
            }
        }
    }

    onCollide() {
        let overlap = this._world.select(this.x, this.y, this.width, this.height);
        for (let ob of overlap) {
            if (ob.traits.has('lethal')) {
                this.loadImage('OBCitizenGeneric_Dead.png');
                this.vx = 0;
                this.traits.addTraitGeneric('immobile');
            }

            if (ob.traits.has('surface')) {
                this._collisions.applyLROUCollision(this, ob);
            }
        }
    }

    onKill() {}

}