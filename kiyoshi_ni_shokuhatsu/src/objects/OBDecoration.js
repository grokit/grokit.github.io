// Decoration OR object that gets created when no image
// is associated with a game object (& attach image to
// this object).
class OBDecoration extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this.zIndex = 10;
        this.traits.addTraitGeneric('decoration');
    }

    tick() {}

}