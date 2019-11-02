//
// Just carries messages in game.
//
// Might go away if I implement observer pattern.
//
class OBMessage extends GameObjectBase {
    constructor(x = 0, y = 0) {
        super(x, y);
        this.zIndex = 10;
        this.traits.addTraitGeneric('decoration');
    }

    tick() {}
}