class OBDisplayLivesAndTriggerNextLevel extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this.zIndex = 90;
        this.traits.addTraitGeneric('decoration');
        this._age = 0;
        this.image = null;
        this._permanentState = Factory.getPermanentState();
    }

    tick() {
        if(this._age == 0){
            let message = new OBMessage();
            message.traits.addTrait(new TRPlayerDefeated());
            Factory.getWorld().addObject(message);

            let text = new OBText(this.x, this.y, 'Lives x ' + this._permanentState.nLives);
            this._world.addObject(text);
        }

        this._age += 1;
    }

}
