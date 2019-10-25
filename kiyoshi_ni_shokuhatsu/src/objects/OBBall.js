class OBBall extends GameObjectBase {
    constructor(x, y) {
        super(x, y);

        this.loadImage("OBBall.png");
        this.traits.addTraitGeneric('friction');
        this.traits.addTraitGeneric('gravity');
        this.traits.addTraitGeneric('bouncy');
    }

    tick() {}
}