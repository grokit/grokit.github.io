// Build objects from string coming from tiled.
class ObjectFactory {
    constructor() {
        let objs = [];
// Reflect objects START.
objs.push( function(){return new OBMessage();});
objs.push( function(){return new OBLevelTransition();});
objs.push( function(){return new OBSpikeCeiling();});
objs.push( function(){return new OBDoorOrangeTravel();});
objs.push( function(){return new OBCitizenGeneric();});
objs.push( function(){return new OBDecoration();});
objs.push( function(){return new OBSurface();});
objs.push( function(){return new OBDisplayLivesAndTriggerNextLevel();});
objs.push( function(){return new OBHero();});
objs.push( function(){return new OBElevator();});
objs.push( function(){return new OBFireball();});
objs.push( function(){return new OBBlockFallIfAbove();});
objs.push( function(){return new OBSpikeFloorRaising();});
objs.push( function(){return new OBInvisibleMarker();});
objs.push( function(){return new OBSpikeCeilingFalling();});
objs.push( function(){return new OBBall();});
objs.push( function(){return new OBBlockUpIfAbove();});
objs.push( function(){return new OBFireSource();});
objs.push( function(){return new OBText();});
// Reflect objects END.
        this._factories = new Map();
        for (let fn of objs) {
            // Don't create template objects yet since assets
            // are not loaded at this point.
            this._factories.set(fn, null);
        }
    }

    // This is super expensive, but as long as it is only
    // at level creation, it is fine.
    _map(filename) {
        let foundObj = null;
        for (let kvp of this._factories) {
            if (kvp[1] == null) {
                this._factories.set(kvp[0], kvp[0]());
            }
            let obj = this._factories.get(kvp[0]);

            for (let ofilename of obj.filenameMappingToThis()) {
                if (filename == ofilename) {
                    if (foundObj != null) {
                        throw new Error("Found > 1 object mapping.");
                    }
                    foundObj = kvp[0]();
                }
            }
        }

        let out = null;
        if (foundObj != null) {
            foundObj.loadImage(filename);
            out = foundObj;
        } else {
            // Default object if we cannot find match.
            out = new OBDecoration();
            out.loadImage(filename);
        }

        // Quality control
        if (out.zIndex < 0 || out.zIndex > 99) {
            throw new Error("Invalid zIndex: " + out.zIndex + " for: " + out.name());
        }

        return out;
    }

    // Creates an object from the raw filename. Example block.png.
    // Params is {k:value} collection.
    // layerId: from background to foreground.
    buildFromName(name, layerId = 10, customProps = null) {
        let obj = this._map(name);
        obj.z = layerId;
        obj.customProps = customProps;
        return obj;
    }
}
