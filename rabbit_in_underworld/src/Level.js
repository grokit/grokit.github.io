/**
 * Loads json tiled (https://www.mapeditor.org/) level.
 */
class Level {

    static load(level, world) {
        // Parse tile https://www.mapeditor.org/ json map.
        let width = level.width;
        let height = level.height;
        let tileWidth = level.tilewidth;
        let tileHeight = level.tileheight;

        // Load a map of all tiles:
        // id -> "gfx/image.png"
        //
        // This is available just based on position in data:
        // x
        // y
        //
        // This is not alailable until we load the images:
        // width
        // height
        let tileIds = {};
        for (let tileset of level.tilesets) {
            for (let key in tileset.tiles) {
                tileIds[key] = tileset.tiles[key].image;
                // ../gfx/tree_02.png -> gfx/tree_02.png
                if (tileIds[key].indexOf('../') == 0) {
                    tileIds[key] = tileIds[key].substr(3);
                }
            }
        }

        // ::-:
        // This is definitely odd that we need world in order to just
        // create object. This is such that those objects have a hook
        // in world in order to add themselves dynamically. 
        // Look for better way.
        let factory = new ObjectFactory(world);

        let elems = new Set();
        for (let layer of level.layers) {
            for (let i = 0; i < layer.data.length; ++i) {
                if (layer.data[i] != 0) {
                    let id = layer.data[i] - 1;
                    let ele = factory.buildFromName(tileIds[id]);
                    let x = i % width;
                    let y = height - Math.floor(i / width) - 1;
                    ele.x = x * tileWidth;
                    ele.y = y * tileHeight;

                    if (ele.y < 0) {
                        throw "ele.y < X";
                    }

                    elems.add(ele);
                }
            }
        }

        return elems;
    }
}