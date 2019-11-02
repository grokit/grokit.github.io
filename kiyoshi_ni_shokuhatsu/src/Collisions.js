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

    vectToCenter(cee, crr) {
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
                if (objL.vx > 0) {
                    objL.vx = 0;
                }
                // :::BB REMOVE
                objL._dir *= -1;
                break;

            case 'right':
                objL.x = objR.x + objR.width;
                if (objL.vx < 0) {
                    objL.vx = 0;
                }
                // :::BB REMOVE
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
}