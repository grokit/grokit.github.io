class OBHero extends GameObjectBase {
    constructor(x, y) {
        super(x, y);
        this._audio = Factory.getGameAudio();

        this.loadImage("OBHero.png");
        this.traits.addTraitGeneric('hero');
        this.traits.addTraitGeneric('stick_to_surface');
        this.traits.addTraitGeneric('friction');
        this.traits.addTraitGeneric('gravity');

        this.zIndex = 99;
        this._keyJumpMem = null;
    }

    tick() {
        if (!this.traits.has('TRPlayerDefeated')) {
            if (!this.traits.has('ducking')) {
                if (this.traits.has('jumping')) {
                    this.loadImage("OBHero_Jump.png");
                } else {
                    this.loadImage("OBHero.png");
                }
            }
        }
    }

    _doWipe() {
        if (!this.traits.has('TRPlayerDefeated')) {
            this.traits.addTrait(new TRPlayerDefeated());
        }

        this.loadImage("OBHero_Dead.png");
    }

    onCollide() {
        let overlap = this._world.select(this.x, this.y, this.width, this.height);
        for (let obj of overlap) {
            if (obj.traits.has('lethal')) {
                this._doWipe();
            }
            if (obj.traits.has('lethal_bottom')) {
                let cprop = this._collisions.collisionProp(this, obj);
                if (cprop.dir == 'under') {
                    this._doWipe();
                }
            }
            if (obj.traits.has('surface')) {
                this._collisions.applyLROUCollision(this, obj);
                this.traits.addTraitGeneric('on_surface', 1);
            }
        }
    }

    _handleKey(key, obj) {
        let sx = 0.14;
        let vxMax = 2;

        if (!obj.traits.has('jumping') && obj.traits.has('ducking')) {
            sx = 0;
        }

        if (obj.traits.has('jumping')) {
            sx /= 2.5;
        }

        if (key.action == 'left' && key.isDown) {
            if (obj.vx > 0) {
                sx *= 1.5;
            }
            obj.vx -= sx;
            obj.flippedHorizontally = true;
        } else if (key.action == 'right' && key.isDown) {
            if (obj.vx < 0) {
                sx *= 1.5;
            }
            obj.vx += sx;
            obj.flippedHorizontally = false;
        } else if (key.action == 'jump' && key.isDown) {
            if (obj.traits.has('on_surface') && !obj.traits.has('jumping')) {
                if (this._keyJumpMem != key.serial) {
                    this._keyJumpMem = key.serial;
                    // this._audio.play(':::BB');
                    //
                    obj.traits.remove('on_surface');
                    obj.traits.addTraitGeneric('jumping', -1);
                    let jmpStr = 3.5;
                    if (Math.abs(obj.vx) >= vxMax * 0.9) {
                        jmpStr += 1.0;
                    }
                    if (obj.traits.has('ducking')) {
                        jmpStr += 2.5;
                        if (obj.flippedHorizontally) {
                            obj.vx = -10;
                        } else {
                            obj.vx = 10;
                        }
                    }
                    obj.vy += jmpStr;
                }
            }
        } else if (key.action == 'down' && key.isDown) {
            obj.traits.addTraitGeneric('ducking');
            this.loadImage("OBHero_Duck.png");
        } else if (key.action == 'down' && key.isUp) {
            obj.traits.remove('ducking');
            this.loadImage("OBHero.png");
        }

        if (obj.vx < 0) {
            obj.vx = Math.max(obj.vx, -vxMax);
        } else {
            obj.vx = Math.min(obj.vx, vxMax);
        }
    }

    onKey(key) {
        if (!this.traits.has('TRPlayerDefeated')) {
            this._handleKey(key, this);
        }
    }

    onKill() {
        // In case OBHero is killed by external object, use this
        // as a means of message-passing to game engine that the
        // hero is dead.
        let message = new OBMessage();
        message.traits.addTrait(new TRPlayerDefeated());
        this._world.addObject(message);
    }
}