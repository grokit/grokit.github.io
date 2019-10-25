class OBInvisibleMarker extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this.zIndex = 0;
        this.traits.addTraitGeneric('invisible_marker');
    }

    tick() {}

}