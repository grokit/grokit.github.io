// As a convention, we use (l, r) to represent the collision of
// l into r, with the consequence of the collision applying to
// r only. The reverse collision will also be triggered, but in
// a different function call.
//
// Coordinates are from bottom-left corner of sprite. Right / up is positive.
//
// A LOT of this logic should be pushed into objects themselfs.
//   e.g. onCollision() implemented instead of here. Just put condition for collision
//   here.
class Collisions {
    static _isCollide(l, r) {

        // Need to romve 1 from width and height such that two objects
        // next to each other don't collide.
        // [0, 1, ..., 63]. Since we use >=, using 64 (full-width) would 
        // make those objects collide.
        let space = 1;
        let pts = [];
        pts.push([l.x, l.y]);
        pts.push([l.x + l.width - space, l.y]);
        pts.push([l.x, l.y + l.height - space]);
        pts.push([l.x + l.width - space, l.y + l.height - space]);

        for (let pt of pts) {
            if (pt[0] >= r.x &&
                pt[0] < r.x + r.width &&
                pt[1] >= r.y &&
                pt[1] < r.y + r.height) return true
        }

        return false;
    }

    static isCollide(l, r) {
        return Collisions._isCollide(r, l) || Collisions._isCollide(l, r);
    }

    static _extractCenter(obj) {
        let cen = {};
        cen.x = obj.x + obj.width / 2;
        cen.y = obj.y + obj.height / 2;
        return cen;
    }

    static _fromCenter(cee, crr) {
        let centerCee = Collisions._extractCenter(cee);
        let centerCrr = Collisions._extractCenter(crr);

        // Vector to remove crr from cee.
        let vec = {};
        vec.x = centerCrr.x - centerCee.x;
        vec.y = centerCrr.y - centerCee.y;

        // Normalize.
        let len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        if (len > 0) {
            vec.x /= len;
            vec.y /= len;
        }

        return vec;
    }

    // This is written from the standpoint of the crr object.
    // E.g.: crr is under cee.
    static collisionProp(crr, cee) {

        let Xs = [crr.x, crr.x + crr.width, cee.x, cee.x +cee.width];
        let Ys = [crr.y, crr.y + crr.height, cee.y, cee.y +cee.height];

        // The default sort in JavaScript is lexicographical order of
        // string conversion. Let's take a pause and ponder on how strange
        // that is, then provide another sort function before we cry or
        // laughs ourselves out of coding this game in JavaScript.
        Xs.sort((a, b) => a - b);
        Ys.sort((a, b) => a - b);

        let rv = {};
        rv.overlapRatio = 
            (Xs[2]-Xs[1])*(Ys[2]-Ys[1]) / 
            Math.min(crr.width*crr.height, cee.width * cee.height);

        if(rv.overlapRatio < 0){
            throw "Negative overlapRatio. Initial bug was due " +
                  "to entertaining Javascript sort. Should never happen now.";
        }

        // If too ambiguous, wait another frame or two to resolve.
        //if(rv.overlapRatio < 0.01){
        if( (Xs[2]-Xs[1])*(Ys[2]-Ys[1]) < 1 ){
            rv.dir = 'none';
            return rv;
        }

        if(Xs[2]-Xs[1] < Ys[2] - Ys[1]){
            if(Xs[1] + (Xs[2]-Xs[1])/2 > crr.x + crr.width/2){
                rv.dir = 'left';
            }else{
                rv.dir = 'right';
            }
        }else{
            if(Ys[1] + (Ys[2]-Ys[1])/2 > crr.y + crr.height/2){
                rv.dir = 'under';
            }else{
                rv.dir = 'over';
            }
        }

        return rv;
    }

    static makeSmokeAt(obj, world, t, offsetY = 0) {
        for (let i = 0; i <= t; ++i) {
            let smoke = world.getFactory().buildFromName("gfx/smoke_dust.png");
            smoke.x = obj.x + obj.width * 0.5 + (Math.random() - 0.5) * obj.width;
            smoke.y = obj.y + offsetY;
            smoke.vx = (0.5 - Math.random()) * 3;
            smoke.vy = 1 + (0.25 - Math.random()) * 3;
            world.addObject(smoke);
            smoke.traits.set('kill', 1000);
        }
    }

    static genericKill(obj, world) {
        let isHero = obj.traits.has('hero');
        if (false && !isHero) {
            obj.traits.set('kill', 0);
        } else {
            if (obj.traits.has('destroy_to_squished')) {
                obj.traits.set('kill', 0);
                let squished = world.getFactory().buildFromName("gfx/squished.png");
                squished.x = obj.x;
                squished.y = obj.y;
                world.addObject(squished);
                squished.traits.set('kill', 1000);
                squished.traits.set('decoration');
                Audio.play('sounds/sfx/object_generic_squished.ogg', 0.5, false);
            } else if (obj.traits.has('destroy_to_smoke')) {
                Collisions.makeSmokeAt(obj, world, 10);
                obj.traits.set('kill', 0);
                Audio.play('sounds/sfx/object_generic_burnt.ogg', 0.5, false);
            } else {
                if (!obj.traits.has('velocity')) {
                    ObjectFactory._velocity(obj);
                    obj.vx = (Math.random() - 0.5) * 10;
                }

                if (obj.traits.has('stompable') || obj.traits.has('fall_on_touch') || obj.traits.has('pushable')) {
                    Collisions.makeSmokeAt(obj, world, 5);
                }

                let vx = obj.vx;
                obj.tick = function() {}
                obj.traits = new Traits();

                ObjectFactory._displayable(obj);
                ObjectFactory._velocity(obj);
                ObjectFactory._gravityLow(obj);
                if (isHero) {
                    obj.traits.add('hero');
                    Audio.play('sounds/sfx/lost_life.ogg', 0.5, false);
                } else {
                    Audio.play('sounds/sfx/object_generic_burnt.ogg', 0.5, false);
                }

                obj.vx = -vx;
                obj.vy = 3;
                obj.traits.add('kill_through_offscreen');
            }
        }
    }

    static norm(vx, vy) {
        let len = Math.sqrt(vx * vx + vy * vy);
        let vec = {};
        vec.x = vx / len;
        vec.y = vy / len;
        return vec;
    }

    static speed(crr) {
        return Math.sqrt(crr.vx * crr.vx + crr.vy * crr.vy);
    }

    static suppressPush(crr, cee) {
        if (!crr.traits.has('pushable') || !cee.traits.has('pushable')) {
            return false;
        }

        return Collisions.speed(crr) < Collisions.speed(cee);
    }

    // Direction of relationship: 
    //
    // - collider: crr, collidee: cee
    // - E.g. of spatial realations: cee is 'over' crr, cee is 'left' of crr.
    //
    // Convention: only modify crr or BOTH, but never cee only.
    //             When the relationship happens on the other side then...
    //             .... OR should resolve both at once, always? (and it should not make a
    //             difference which one is first)?
    //
    // ::B:This is no longer perfectly stackable. Should refactor such that collision-type if infered first, then
    //     no matter what modifications individual if(...) do, the order does not matter.
    //     since (l, r) is done first then (r, l), not sure there is a way to be perfect here. Maybe impose an order,
    //     run (l, r) then (r, l), THEN apply changes?
    //
    // Collisions gotchas:
    // - Order of collisions create lots of side-effects.
    // - Multiple collisions at the same time is source of non-determinism if cannot handle them in a form of priority-order.
    // - Resolving a collision might put into collision, which will have to wait next loop to be resolved (unless make recursive, which could be a bottleneck).
    //   - This can also lead to "harmonic-like" behavior: toggle between two collisions states in successive frames.
    static collide(crr, cee, world, engine) {

            if (crr.traits.has('kill_through_offscreen')) {
                return;
            }

            let collisionProp = Collisions.collisionProp(crr, cee);

            if (crr.traits.has('hero') && cee.traits.has('transform_to_gorilla')) {

                crr.traits.remove('hero');

                let nobj = world.getFactory().buildFromName("gfx/pants_gorilla_r0.png");
                nobj.x = crr.x;
                nobj.y = crr.y;
                world.addObject(nobj);

                crr.traits.set('kill', 0);
                cee.traits.set('kill', 0);
            }

            // Block that falls (immediately) when you touch it (and survive after touching the floor).
            // ::B: -> if invert crr / cee, does not work. Investigate.
            if (!crr.traits.has('decoration') && !cee.traits.has('velocity') && cee.traits.has('fall_on_touch')) {
                cee.touched();
            }

            if (!cee.traits.has('decoration') && (cee.traits.has('pushable') || !cee.traits.has('surface')) && crr.traits.has('button')) {
                crr.press();
            }

            if (crr.traits.has('push_hero') && cee.traits.has('hero')){
                cee.vy += 6;
                cee.vx += 7*crr.vx;
            }

            if (cee.traits.has('hero') && crr.traits.has('draggable')) {
                crr.vx = cee.vx * 1.5;
                crr.vy = cee.vy * 2;
                if (cee.vy > crr.vx) {
                    crr.vx *= 2;
                }
            }

            if (cee.traits.has('hero') && crr.traits.has('bomb')) {
                crr.ignite();
            }

            if (cee.traits.has('explode_push') && crr.traits.has('velocity')) {
                let oppositeForce = Collisions._fromCenter(crr, cee);
                let vv = Collisions.norm(oppositeForce.x, oppositeForce.y);
                crr.vx += -vv.x * 7;
                crr.vy += -vv.y * 7;
            }

            if (crr.traits.has('explosion_applies_outward_force') && !cee.traits.has('decoration') && !cee.traits.has('bomb')) {
                // not sure it's fun to not be able to walk through anymore
                Collisions.genericKill(cee, world);
            }

            if (crr.traits.has('bomb') && cee.traits.has('explosion_applies_outward_force')) {
                crr.ignite();
            }

            // Kill objects that have large overlap and solidity differential.
            //
            // Order issue again: since only one of the two objects have run collision detection,
            // then it can be vMax into the other object after falling for a long time. 
            if(
                !cee.traits.has('kill_through_offscreen') && 
                !cee.traits.has('decoration') && 
                !crr.traits.has('decoration') && 
                !crr.traits.has('no_overlap_kill') && 
                collisionProp.overlapRatio > 0.65 && 
                crr.getSolidity() < cee.getSolidity()){
                if(false){
                    // 0.45 might seem large number, but object's vy can be pretty high,
                    // resulting in significant overlap for first collision.
                    Console.debug('--');
                    Console.debug(crr);
                    Console.debug(cee);
                    Console.debug(collisionProp.overlapRatio);
                    Collisions.collisionProp(crr, cee);
                }
                Collisions.genericKill(crr, world);
            }

            // Collision with walls and floor.
            // ::B: surface == cannot be pushed. Bad logic.
            //     ^^ should have a hero-specific logic, and everything else separated
            if (crr.traits.has('stands_on_surface') && cee.traits.has('surface')) {
                let collType = collisionProp.dir;

                switch (collType) {

                    case 'left':

                        // ::B: REVERT --> always only modify CRR
                        // Have to do this before we remove crr's vx.
                        if (crr.traits.has('velocity') && cee.traits.has('pushable')) {
                            if (!Collisions.suppressPush(crr, cee)) {
                                cee.x = crr.x + crr.width;
                                cee.vx = crr.vx;
                            }
                        } else {
                            if(!cee.traits.has('surface_top_only')){
                                crr.x = cee.x - crr.width;
                                crr.vx = 0;
                            }
                        }

                        if (crr.traits.has('walks')) {
                            crr.hitObstacle()
                        }

                        break;

                    case 'right':

                        // Have to do this before we remove crr's vx.
                        if (crr.traits.has('velocity') && cee.traits.has('pushable')) {
                            if (!Collisions.suppressPush(crr, cee)) {
                                cee.x = crr.x - cee.width;
                                cee.vx = crr.vx;
                            }
                        } else {
                            if(!cee.traits.has('surface_top_only')){
                            crr.x = cee.x + cee.width;
                            crr.vx = 0;
                            }
                        }

                        if (crr.traits.has('walks')) {
                            crr.hitObstacle()
                        }

                        break;

                    case 'over':
                        crr.vy = 0;
                        crr.y = cee.y + cee.height;

                        // Use > 1: if on a falling surface, want to give a grace
                        // period to jump.
                        crr.traits.set('on_surface', 12);
                        if (cee.traits.has('walked_on_action')) {
                            cee.onWalkedOn(crr);
                        }
                        break;

                    case 'under':
                        // ::B: move to own thing.
                        if (cee.traits.has('stomp_on_object_below') && !crr.traits.has('decoration')) {
                            Collisions.genericKill(crr, world);
                        }

                        if (!crr.traits.has('on_surface')) {
                            crr.traits.set('jumping', 0);
                        }

                        if(!cee.traits.has('surface_top_only')){
                            crr.vy = 0;
                            crr.y = cee.y - crr.height;
                        }

                        break;

                    case 'none':
                        break;

                    default:
                        throw "not understanding collision: " + collType;
                        break;
                }
            }

            // After colliding (e.g. wall), bullet falls.
            if(crr.traits.has('bullet') && !crr.traits.has('gravity') && !cee.traits.has('decoration')){
                crr.traits.add('gravity');
            }

            // Subtle way in which ordering matters: if we invert crr, cee, then
            // if the direction which removes from collision runs first, then this
            // never happens.
            if (crr.traits.has('velocity') && cee.traits.has('moving_platform')) {
                crr.x += cee.vx;
            }

            // If an enemy collides with enemy:
            // - Change direction if lateral.
            // - One dies if on top of each other.
            if (
                crr.traits.has('walks') && 
                cee.traits.has('walks') && 
                crr.traits.has('self_collide_change_dir') && 
                cee.traits.has('self_collide_change_dir') && 
                !crr.traits.has('bullet')) {

                switch (collisionProp.dir) {
                    case 'right':
                        // Note: only right, onlt one of the two resolves
                        // the collision for both.
                        cee.hitObstacle()
                        cee.vx = 0;
                        crr.hitObstacle()
                        crr.vx = 0;
                        crr.x = cee.x + cee.width;
                        cee.x = crr.x - crr.width;
                        break;
                    case 'over':
                        if (cee.traits.has('stompable')) {
                            crr.vy = 25;
                            cee.traits.set('kill', 0);
                        }
                        break;
                }
            }

            // Lethal stuff kills crr on contact. :B:: reversed?
            if (!crr.traits.has('immune_to_lethal') && 
                !crr.traits.has('kill_through_offscreen') && 
                !crr.traits.has('decoration') && 
                !crr.traits.has('bomb') && 
                cee.traits.has('lethal')) {
                Collisions.genericKill(crr, world);
            }

            // Hero-specific collision with enemy that can stomp on.
            if (crr.traits.has('hero') && cee.traits.has('stompable')) {
                if (crr.traits.has('hero_strong_mode')) {
                    Collisions.genericKill(cee, world);
                } else {
                    let collided = false;
                    if (collisionProp.dir != 'over') {
                        // Be super-generous and don't die if sort of on top.
                        if (!(crr.y >= cee.y + 0.333 * cee.height)) {
                            Collisions.genericKill(crr, world);
                            collided = true;
                        }
                    }

                    if (!collided) {
                        // ::B: eeeh --> code better controllable (small jump if not pressing key)
                        crr.vy = 10;
                        crr.traits.set('jumping', 15);
                        cee.traits.set('kill', 0);
                        Collisions.genericKill(cee, world);
                    }
                }
            }

            if ((crr.traits.has('hero') && cee.traits.has('to_next_level'))) {
                engine.notifyNextLevel();
            }

        } // endof: collide function
}
