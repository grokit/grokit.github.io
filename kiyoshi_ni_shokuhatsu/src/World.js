class World {
    constructor() {
        // Factory classes
        this._constants = Factory.getConstants();
        this._collisions = Factory.getCollisions();
        this._console = Factory.getConsole();

        // Contains: Map[x][y] = Set();
        this._objects = new Map();

        // How large are the squares in which we bucket objects to make
        // collision detection efficient.
        // ... this basically restricts the size of the largest
        // collideable object that can be put in the game.
        this._dxy = this._constants.blockSize() * 2;

        // (minX, minY, maxX, maxY) of non-decoration objects.
        this._levelBoundary = [];
    }

    clearAll() {
        this._objects = new Map();
    }

    // ONLY use in tests -- this is O(n) lookup.
    TEST_ONLY_isInWorld(other) {
        for (let obj of this.objectsIterator()) {
            if (obj == other) {
                return true;
            }
        }

        return false;
    }

    addObject(object) {
        let square = this.findOrCreateSquare(object);
        object.container = square;
        square.add(object);
    }

    deleteObject(object) {
        object.container.delete(object);
    }

    findSquareXY(x, y) {
        let squareX = Math.floor(x / this._dxy);
        let squareY = Math.floor(y / this._dxy);
        return [squareX, squareY]
    }

    findOrCreateSquare(object) {
        let [squareX, squareY] = this.findSquareXY(object.x, object.y);
        if (!this._objects.has(squareX)) {
            this._objects.set(squareX, new Map());
        }

        if (!this._objects.get(squareX).has(squareY)) {
            this._objects.get(squareX).set(squareY, new Set());
        }

        return this._objects.get(squareX).get(squareY);
    }

    getNearbyObjects(object) {
        let objects = new Array();
        let [squareX, squareY] = this.findSquareXY(object.x, object.y);
        for (let i = squareX - 1; i <= squareX + 1; ++i) {
            for (let j = squareY - 1; j <= squareY + 1; ++j) {
                if (this._objects.has(i)) {
                    if (this._objects.get(i).has(j)) {
                        for (let object of this._objects.get(i).get(j)) {
                            objects.push(object);
                        }
                    }
                }
            }
        }

        return objects;
    }

    notifyObjectMoved(object) {
        let square = this.findOrCreateSquare(object);
        if (square != object.container) {
            let oldContainer = object.container;
            object.container = square;
            square.add(object);
            oldContainer.delete(object);
        }
    }

    // Select all objects in square. 
    select(x, y, dx, dy) {
        if (dx < 0 || dy < 0) {
            throw "Do not use negative length.";
        }

        let objects = new Array();

        let dedup = new Set();
        // Find all squares that can intersect with selection.
        for (let i = x - this._dxy; i <= x + dx + this._dxy; i += this._dxy) {
            for (let j = y - this._dxy; j <= y + dy + this._dxy; j += this._dxy) {
                let [squareX, squareY] = this.findSquareXY(i, j);
                if (this._objects.has(squareX) && this._objects.get(squareX).has(squareY)) {
                    for (let object of this._objects.get(squareX).get(squareY)) {
                        objects.push(object);

                        if (dedup.has(object.id)) {
                            throw new Error("Should never get same object twice.");
                        }
                        dedup.add(object.id);
                    }
                }
            }
        }

        let dummy = {};
        dummy.x = x;
        dummy.y = y;
        dummy.width = dx;
        dummy.height = dy;

        let of = new Array();
        for (let obj of objects) {
            if (this._collisions.isCollide(dummy, obj)) {
                of.push(obj);
            }
        }

        return of;
    }

    // SO: don't need to worry about adding / deleting during
    // iterations: https://stackoverflow.com/questions/35940216/es6-is-it-dangerous-to-delete-elements-from-set-map-during-set-map-iteration
    objectsIterator() {
        return new IteratorNDimensions(this._objects[Symbol.iterator]());
    }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
class IteratorNDimensions {

    constructor(itx) {
        this._its = new Array();
        this._its.push(itx);
    }

    [Symbol.iterator]() {
        return this;
    };

    // Recursively resolve the next object in iterators.
    //
    // If object itself is a container, return the iterator through:
    //   object[Symbol.iterator]()
    //
    // This allows to iterate the leaf object through an arbitrarily
    // deep nested container relationship.
    recursivelyResolveIterator(sIt) {
        if (sIt.length == 0) return {
            done: true
        };

        let it = sIt[sIt.length - 1];

        let v = it.next();
        if (v.done) {
            sIt.pop();
            return this.recursivelyResolveIterator(sIt);
        }

        // Maps return [k, v], set return [v].
        if (v.value.length > 1) {
            // This is a map (non-terminal), enqueue self.
            v = v.value[1][Symbol.iterator]();
            sIt.push(v);
            return this.recursivelyResolveIterator(sIt);
        }

        return {
            value: v.value,
            done: false
        };
    }

    next() {
        return this.recursivelyResolveIterator(this._its);
    }
}