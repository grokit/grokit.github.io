class OBFireball extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this.loadImage("OBFireball.png");
        this.traits.addTraitGeneric('lethal', -1);
        this.zIndex = 95;
        this.traits.addTraitGeneric('stick_to_surface');
    }

    tick() {}
}