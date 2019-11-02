class OBElevator extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        // Generic traits are named on the spot when they are added.
        this._audio = Factory.getGameAudio();
        this.vy = -3;
        this._world = Factory.getWorld();
        this._time = 0;

        this._images = ["OBElevator.png", "elevator_electrocuted.png"];
        this._iImage = 0;

        this.traits.addTraitGeneric('lethal');
    }

    tick() {
        let update = false;
        if (this._time % 10 == 0) {
            this._iImage = (this._iImage + 1) % this._images.length;
            update = true;
        }
        if (update) {
            this.loadImage(this._images[this._iImage]);
        }

        this._time += 1;
    }

    onCollide() {
        let overlap = this._world.select(this.x, this.y, this.width, this.height);
        for (let ob of overlap) {
            if (ob.traits.has('invisible_marker')) {
                this.vy = -this.vy;
                break;
            }
        }

    }

}