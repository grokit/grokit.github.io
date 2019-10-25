class OBFireSource extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this.traits.remove('moveable');

        this.zIndex = 80;
        this._world = Factory.getWorld();
        this._angle = 0;
        this._x = 0;
    }

    tick() {

        if (this._x % 5 == 0 && this._angle % 180 < 90) {
            let peek = new OBFireball();

            for (let i of[1, -1]) {
                let fire = new OBFireball(this.x + this.width / 2 - peek.width / 2, this.y + this.height / 2 - peek.height / 2);

                let speed = 0.6;
                let angle = 90 + this._angle * i;
                fire.vx = speed * Math.cos((angle / 360) * (2 * Math.PI));
                fire.vy = speed * Math.sin((angle / 360) * (2 * Math.PI));

                fire.traits.addTraitGeneric('kill', 60 * 1.5);

                this._world.addObject(fire);
            }
        }

        this._angle += 1.6;
        this._angle = this._angle % 360;
        this._x += 1;
    }
}