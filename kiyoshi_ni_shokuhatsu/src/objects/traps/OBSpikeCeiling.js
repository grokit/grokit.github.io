class OBSpikeCeiling extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this.traits.addTraitGeneric('lethal');
    }

    tick() {}
}