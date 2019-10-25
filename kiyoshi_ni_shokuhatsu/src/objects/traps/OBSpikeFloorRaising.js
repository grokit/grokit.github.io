class OBSpikeFloorRaising extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this.zIndex = 10;
        this._anchorY = -1;

        this._phase = 0;
        this._phaseUp = 195;
        this._phaseDown = 200;
        this._phaseLen = 225;
        this._eleFrac = 0.8;
    }

    tick() {
        if (this._anchorY == -1) {
            this._anchorY = this.y;
        }

        this._phase = (this._phase + 1) % this._phaseLen;

        if (this._phase < this._phaseUp) {
            this.traits.remove('lethal');
            this.y = this._anchorY - this.height * this._eleFrac;
        } else if (this._phase < this._phaseDown) {
            if (!this.traits.has('lethal')) {
                this.traits.addTraitGeneric('lethal');
            }
            this.y = this._anchorY - this.height * this._eleFrac + this.height * this._eleFrac * (this._phase - this._phaseUp) / (this._phaseDown - this._phaseUp);
        } else {
            this.y = this._anchorY - this.height * this._eleFrac * (this._phase - this._phaseDown) / (this._phaseLen - this._phaseDown);
        }

        this._phase += 1;
    }
}
