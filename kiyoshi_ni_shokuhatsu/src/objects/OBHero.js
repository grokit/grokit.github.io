class OBHero extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this._audio = Factory.getGameAudio();

        this.loadImage("OBHero.png");
        this.traits.addTrait(new TRControllable());
        this.traits.addTraitGeneric('hero');
        this.traits.addTraitGeneric('stick_to_surface');
        this.traits.addTraitGeneric('friction');
        this.traits.addTraitGeneric('gravity');

        this.zIndex = 100;
    }

    tick() {
        if (this.traits.has('jumping')) {
            this.loadImage("OBHero_Jump.png");
        } else {
            this.loadImage("OBHero.png");
        }

        // ::: what's the difference between putting this in here or in collision?
        // ::: maybe to ensure ORDERING?
        // ::: wouldn't it be MUCH MORE efficient to have object self-elect collision? (avoid gathering mostly non-colliding objects?)
        let overlap = this._world.select(this.x, this.y, this.width, this.height);
        for (let ob of overlap) {
            if (ob.traits.has('lethal')) {
                this.traits.addTraitGeneric('kill', 0);
            }
            if (ob.traits.has('surface')) {
                //this._collisions.applyLROUCollision(this, ob);
            }
        }
    }

    onKill() {
        let deadAnim = new OBDecoration(this.x, this.y);
        deadAnim.traits.addTraitGeneric('ttl', 5);
        deadAnim.traits.remove('decoration');
        this._lastImageLoaded = 'OBHero_Dead.png';
        if (this._lastImageLoaded != '') {
            deadAnim.loadImage(this._lastImageLoaded);
        }
        deadAnim.zIndex = this.zIndex;
        deadAnim.traits.addTraitGeneric('gravity');
        this._world.addObject(deadAnim);
    }
}