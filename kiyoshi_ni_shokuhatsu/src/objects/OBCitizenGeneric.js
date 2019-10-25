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

        let overlap = this._world.select(this.x, this.y, this.width, this.height);
        for (let ob of overlap) {
            if (ob.traits.has('lethal')) {
                this.traits.addTraitGeneric('kill', 0);
            }
        }
    }

    onKill() {
        let deadAnim = new OBDecoration(this.x, this.y);
        deadAnim.loadImage('OBCitizenGeneric_Dead.png');
        deadAnim.zIndex = this.zIndex;
        deadAnim.traits.remove('decoration');
        deadAnim.traits.addTraitGeneric('gravity');
        // ::: isn't this a good example of why make collisions in traits?
        // --> it's pretty hard to say "behave like a normal object"?
        deadAnim.traits.addTraitGeneric('stick_to_surface');
        this._world.addObject(deadAnim);
    }

}