class World {
    constructor() {
        // Map[x][y] = Set();
        // How large are the squares in which we bucket objects to make
        // collision detection efficient.
        this._dxy = 150;
        this._objects = new Map();

        this._moveList = new Set();

        // Functions triggered when objects are added and removed
        // to link between our world and the renderer.
        this._rendererNotify = null;
    }

    setRendererNotify(rendererNotify) {
        this._rendererNotify = rendererNotify;
    }

    addObject(object) {
        let square = this.findOrCreateSquare(object);
        object.container = square;
        square.add(object);

        if (object.traits.has('displayable')) {
            this._rendererNotify.addObject(object);
        }
    }

    deleteObject(object) {
        object.container.delete(object);
        if (object.traits.has('displayable')) {
            this._rendererNotify.deleteObject(object);
        }
    }

    notifyObjectMoved(object) {
        let square = this.findOrCreateSquare(object);
        if (square != object.container) {
            this._moveList.add(object);
        }

        if (object.traits.has('displayable')) {
            this._rendererNotify.notifyObjectMoved(object);
        }
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

    flushBuffers() {
        for (let object of this._moveList) {
            object.container.delete(object);
            let square = this.findOrCreateSquare(object);
            object.container = square;
            square.add(object);
        }
        this._moveList = new Set();
    }

    objectsIterator() {
        return new IteratorNDimensions(this._objects[Symbol.iterator]());
    }

    countSquares() {
        let t = 0;
        for (let sx of this._objects) {
            for (let sy of sx[1]) {
                t += 1;
            }
        }

        return t;
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

        if (v.done) {
            throw 'invalid state recursivelyResolveIterator';
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