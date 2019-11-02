class OBDoorOrangeTravel extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
    }

    tick() {
    }

    onCollide() {
    }

    onKey(key) {
        if (key.action == 'up' && key.isDown) {
            this._travelTo = this.customProps['travel_to'];
            let overlap = this._world.select(this.x, this.y, this.width, this.height);
            for (let obj of overlap) {
                if (obj.traits.has('hero')) {
                    let message = new OBMessage();
                    message.traits.addTrait(new TRTravelToLevel(this._travelTo));
                    this._world.addObject(message);
                    console.log(message);
                }
            }
        }
    }
}
