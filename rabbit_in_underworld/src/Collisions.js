// As a convention, we use (l, r) to represent the collision of
// l into r, with the consequence of the collision applying to
// r only. The reverse collision will also be triggered, but in
// a different function call.
//
// Coordinates are from bottom-left corner of sprite. Right / up is positive.
class Collisions {
    static _isCollide(l, r) {

        // Need to -1 the width and heigh so that adjacent objects don't
        // collide 'at rest'. For example, in 64-grid system:
        // obj1 horizontal:  0 ... 63
        // obj2 horizontal: 64 ... 127

        let space = 1;
        let pts = [];
        pts.push([l.x, l.y]);
        pts.push([l.x + l.width - space, l.y]);
        pts.push([l.x, l.y + l.height - space]);
        pts.push([l.x + l.width - space, l.y + l.height - space]);

        // Not >=, <= to avoid two adjacent but immobile objects to collide
        // with each other.
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

    // This is written from the standpoint of the right object.
    //
    // ::: calling convention is reversed?
    static collisionProp(cee, crr) {

        let rv = {};

        // By removing last velocity, we know where the object was before
        // it collided.
        if (crr.y - crr.vy >= cee.y + cee.height) {
            rv.dir = 'over';
        } else if (crr.x - crr.vx + crr.width <= cee.x) {
            rv.dir = 'left';
        } else if (crr.x - crr.vx >= cee.x + cee.width) {
            rv.dir = 'right';
        } else if (crr.y - crr.vy + crr.height <= cee.y) {
            rv.dir = 'under';
        } else {
            rv.dir = 'none';
            rv.oppositeForce = Collisions._fromCenter(cee, crr);
            return rv;
        }

        return rv;
    }

    static makeSmokeBelow(obj, world, t) {
        for (let i = 0; i <= t; ++i) {
            let smoke = world.getFactory().buildFromName("gfx/smoke_dust.png");
            smoke.x = obj.x + obj.width * i / t;
            smoke.y = obj.y;
            smoke.vx = (0.5 - Math.random()) * 3;
            smoke.vy = Math.random() * 1;
            world.addObject(smoke);
            smoke.traits.set('kill', 1000);
        }
    }

    // Direction of relationship: 
    //
    // - collider: crr, collidee: cee
    // - crr collides on crr.
    // - E.g. of spatial realations: cee is 'over' crr.
    //
    // ::: rename r to cee (collidee).
    // ::: this is no longer perfectly stackable. Should refactor such that collision-type if infered first, then
    //     no matter what modifications individual if(...) do, the order does not matter.
    //     since (l, r) is done first then (r, l), not sure there is a way to be perfect here. Maybe impose an order,
    //     run (l, r) then (r, l), THEN apply changes?
    static collide(crr, cee, world) {
        if (false) {
            let t = crr;
            crr = cee;
            cee = t;
        }

        let collisionProp = Collisions.collisionProp(cee, crr);

        // Subtle way in which ordering matters: if we invert crr, cee, then
        // if the direction which removes from collision runs first, then this
        // never happens.
        if (crr.traits.has('velocity') && cee.traits.has('moving_platform')) {
            crr.x += cee.vx;
        }

        // Collision with walls and floor.
        if (crr.traits.has('collides_on_surface') && cee.traits.has('surface')) {
            switch (collisionProp.dir) {
                case 'left':
                    crr.x = cee.x - crr.width;
                    crr.vx = 0;

                    if (crr.traits.has('walks')) {
                        crr.walkDirection *= -1;
                    }

                    break;
                case 'right':
                    crr.x = cee.x + cee.width;
                    crr.vx = 0;

                    if (crr.traits.has('walks')) {
                        crr.walkDirection *= -1;
                    }

                    break;
                case 'over':
                    crr.vy = 0;
                    crr.y = cee.y + cee.height;

                    // Use > 1: if on a falling surface, want to give a grace
                    // period to jump.
                    crr.traits.set('on_surface', 12);
                    break;
                case 'under':
                    crr.vy = 0;
                    crr.y = cee.y - crr.height;
                    break;

                case 'none':
                    if (Math.abs(collisionProp.oppositeForce.y) >= Math.abs(collisionProp.oppositeForce.x)) {
                        if (collisionProp.oppositeForce.y < 0) {
                            crr.vy = 0;
                            crr.y = cee.y - crr.height;
                        } else {
                            crr.vy = 0;
                            crr.y = cee.y + cee.height;
                        }
                    } else {
                        if (collisionProp.oppositeForce.x < 0) {
                            crr.x = cee.x - crr.width;
                            crr.vx = 0;
                        } else {
                            crr.x = cee.x + cee.width;
                            crr.vx = 0;
                        }
                    }
                    break;

                default:
                    throw "not understanding collision";
                    break;
            }
        }

        // If an enemy collides with enemy:
        // - Change direction if lateral.
        // - One dies if on top of each other.
        if (cee.traits.has('stompable') && crr.traits.has('stompable') && !crr.traits.has('bullet')) {
            switch (collisionProp.dir) {
                case 'left':
                case 'right':
                    if (crr.traits.has('walks')) {
                        crr.walkDirection *= -1;
                        crr.vx = -crr.vx;

                        cee.walkDirection *= -1;
                        cee.vx = -cee.vx;
                    }
                    break;
                case 'over':
                    crr.vy = 25;
                    cee.traits.set('kill', 0);
                    break;

                default:
                    break;
            }
        }

        // Lethal stuff kills crr on contact.
        if (cee.traits.has('lethal') && !crr.traits.has('immune_to_lethal')) {
            if (crr.traits.has('stompable') || crr.traits.has('fall_on_touch')) {
                Collisions.makeSmokeBelow(crr, world, 5);
            }

            crr.traits.set('kill', 0);
        }

        // Hero-specific collision with enemy that can stomp on.
        if (crr.traits.has('hero') && cee.traits.has('stompable')) {
            let collided = false;
            switch (collisionProp.dir) {
                case 'left':
                case 'right':
                case 'under':
                default:
                    if (!(crr.y >= cee.y + 0.5 * cee.height)) {
                        crr.traits.set('kill', 0);
                        collided = true;
                    } else {
                        // Be super-generous and don't die if sort of on top.
                    }
                    break;
            }

            if (!collided) {
                crr.vy = 20;
                cee.traits.set('kill', 0);


                if (cee.traits.has('destroy_to_squished')) {
                    let squished = world.getFactory().buildFromName("gfx/squished.png");
                    squished.x = cee.x;
                    squished.y = cee.y;
                    world.addObject(squished);
                    squished.traits.set('kill', 1000);
                } else {
                    Collisions.makeSmokeBelow(cee, world, 5);
                }
            }
        }

        if (!cee.traits.has('velocity') && cee.traits.has('fall_on_touch')) {
            ObjectFactory._velocity(cee);
            ObjectFactory._gravity(cee);
            cee.vy = 3;
        }

        if (cee.traits.has('to_next_level') && crr.traits.has('hero')) {
            let nobj = world.getFactory().buildGameStateObject('next_level', -1);
            world.addObject(nobj);
        }

    } // endof: collide function
}
