class Utils {
    //  E.g.: "gfx/backgrounds/tree_blocky.png" -> "tree_blocky.png"
    static fullpathToFilename(fullpath) {
        return fullpath.substring(fullpath.lastIndexOf('/') + 1);
    }

    static setupLevelObjectInWorld(level, world, camera) {
        world.clearAll();

        for (let obj of level.objects) {
            world.addObject(obj);
        }

        //
        //:::BBB replace: have camera automatically do this if no
        //              hero seen for X frames.
        //
        // Focus on new hero location after load.
        let foundHero = false;
        for (let obj of world.objectsIterator()) {
            if (obj.traits.has('hero')) {
                foundHero = true;
                camera.notifyTrackedObject(obj, true);
            }
        }
        if(!foundHero){
            let obj = new OBDecoration(0, 0);
            camera.notifyTrackedObject(obj, true);
        }

        let message = new OBMessage();
        message.traits.addTrait(new TRSetBackgroundColor(level.backgroundColor));
        world.addObject(message);
    }

    static assert(cond, message = "") {
        if (!cond) {
            throw new Error(message);
        }
    }

    static assertEquals(vl, vr, message = "") {
        if (vl != vr) {
            throw new Error(message);
        }
    }
}
