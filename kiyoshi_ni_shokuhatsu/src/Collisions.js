// As a convention, we use (l, r) to represent the collision of
// l into r, with the consequence of the collision applying to
// r only. The reverse collision will also be triggered, but in
// a different function call.
//
// Coordinates are from bottom-left corner of sprite. Right / up is positive.
class Collisions {
    _isCollide(l, r) {

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

    isCollide(l, r) {
        return this._isCollide(r, l) || this._isCollide(l, r);
    }

    // This is written from the standpoint of the crr object.
    // E.g.: crr is under cee.
    collisionProp(crr, cee) {

        let Xs = [crr.x, crr.x + crr.width, cee.x, cee.x + cee.width];
        let Ys = [crr.y, crr.y + crr.height, cee.y, cee.y + cee.height];

        // The default sort in JavaScript is lexicographical order of
        // string conversion. Let's take a pause and ponder on how strange
        // that is, then provide another sort function before we cry or
        // laugh ourselves out of coding this game in JavaScript.
        Xs.sort((a, b) => a - b);
        Ys.sort((a, b) => a - b);

        let rv = {};
        rv.overlapRatio =
            (Xs[2] - Xs[1]) * (Ys[2] - Ys[1]) /
            Math.min(crr.width * crr.height, cee.width * cee.height);

        if (rv.overlapRatio < 0) {
            throw "Negative overlapRatio. Initial bug was due " +
                "to entertaining Javascript sort. Should never happen now.";
        }

        // If too ambiguous, wait another frame or two to resolve.
        //if(rv.overlapRatio < 0.01){
        if ((Xs[2] - Xs[1]) * (Ys[2] - Ys[1]) < 1) {
            rv.dir = 'none';
            return rv;
        }

        if (Xs[2] - Xs[1] < Ys[2] - Ys[1]) {
            if (Xs[1] + (Xs[2] - Xs[1]) / 2 > crr.x + crr.width / 2) {
                rv.dir = 'left';
            } else {
                rv.dir = 'right';
            }
        } else {
            if (Ys[1] + (Ys[2] - Ys[1]) / 2 > crr.y + crr.height / 2) {
                rv.dir = 'under';
            } else {
                rv.dir = 'over';
            }
        }

        return rv;
    }

    _norm(vx, vy) {
        let len = Math.sqrt(vx * vx + vy * vy);
        let vec = {};
        vec.x = vx / len;
        vec.y = vy / len;
        return vec;
    }

    _speed(crr) {
        return Math.sqrt(crr.vx * crr.vx + crr.vy * crr.vy);
    }

    _extractCenter(obj) {
        let cen = {};
        cen.x = obj.x + obj.width / 2;
        cen.y = obj.y + obj.height / 2;
        return cen;
    }

    _fromCenter(cee, crr) {
        let centerCee = this._extractCenter(cee);
        let centerCrr = this._extractCenter(crr);

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

    // Interpretation: objL is `over` objR.
    // Same with `left`, ...
    applyLROUCollision(objL, objR) {
        let collisionProp = this.collisionProp(objL, objR);
        let collType = collisionProp.dir;

        switch (collType) {

            case 'left':
                objL.x = objR.x - objL.width;
                objL.vx = 0;
                // ::: REMOVE
                objL._dir *= -1;
                break;

            case 'right':
                objL.x = objR.x + objR.width;
                objL.vx = 0;
                // ::: REMOVE
                objL._dir *= -1;
                break;

            case 'over':
                objL.vy = 0;
                objL.y = objR.y + objR.height;
                if (objL.traits.has('jumping')) {
                    objL.traits.remove('jumping');
                }
                break;

            case 'under':
                objL.vy = 0;
                objL.y = objR.y - objL.height;
                break;

            case 'none':
                break;

            default:
                throw new Error("Not understanding collision type: " + collType);
                break;
        }
    }

    // Collisions gotchas:
    //
    // - Order of collisions create lots of side-effects.
    //    - obj1 and obj2 collide, resolving obj1 collision results in obj2 not detecting collision later in same loop.
    //      - Sol: Could resolve collision in closure at the end of whole loop.
    //
    // - Multiple collisions at the same time is source of non-determinism 
    //   if cannot handle them in a form of priority-order.
    //      - Coll(obj1, obj2, obj3) -> resolving in closure might make this better.
    //
    // - Resolving a collision might put into collision, which will have 
    //   to wait next loop to be resolved (unless make recursive, which 
    //   could be a bottleneck). This can also lead to "harmonic-like" 
    //   behavior: toggle between two collisions states in successive frames.
    //
    // - 3+ way collisions: is that even a good idea to try to code
    //   this?
    //
    //????????????????????????????????????????????  
    // Direction of relationship: 
    //
    // - collider: crr, collidee: cee
    // - E.g. of spatial realations: cee is 'over' crr, cee is 'left' of crr.
    //
    // Convention: only modify crr or BOTH, but never cee only.
    //             When the relationship happens on the other side then...
    //             .... OR should resolve both at once, always? (and it should not make a
    //             difference which one is first)?
    //????????????????????????????????????????????  
    // =========================================================================
    //
    // =========================================================================
    // --> how to delegate that to smaller classes eventually?
    //
    // CONVENTION: --> ONLY every take action on objL.
    //
    onCollide(objL, objR) {
        // ???? would it make sense to define collisions in a trait.
        // Then trait can require other co-trait, and traits of other
        // object.
        // ????
        // Collision with walls and floor.
        //
        // objL is <x> in relation to objR.
        // E.g.: objL is 'over' objR.
        if (objL.traits.has('stick_to_surface') && objR.traits.has('surface')) {
            this.applyLROUCollision(objL, objR);
        }

        /*
        if ((objL.traits.has('bouncy') && objR.traits.has('bouncy'))) {
            let coll = this._fromCenter(objL, objR);
            let speed = 2;
            objL.vx -= speed * coll.x;
            objL.vy -= speed * coll.y;
        }

        if ((objL.traits.has('bouncy') && objR.traits.has('hero'))) {
            let coll = this._fromCenter(objL, objR);
            let speed = 5;
            objL.vx += speed * coll.x;
            objL.vy += speed * coll.y;
        }
        */
    }
}