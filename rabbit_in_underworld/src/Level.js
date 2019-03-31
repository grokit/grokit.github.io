class Level {

    /**
     * Loads json tiled (https://www.mapeditor.org/) level.
     * Docs: https://doc.mapeditor.org/en/stable/reference/json-map-format/
     */
    static load(tiledLevelJSON, world) {
        // Parse tile https://www.mapeditor.org/ json map.
        let width = tiledLevelJSON.width;
        let height = tiledLevelJSON.height;
        let tileWidth = tiledLevelJSON.tilewidth;
        let tileHeight = tiledLevelJSON.tileheight;

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
        for (let tileset of tiledLevelJSON.tilesets) {
            for (let key in tileset.tiles) {
                tileIds[key] = tileset.tiles[key].image;
                // ../gfx/tree_02.png -> gfx/tree_02.png
                if (tileIds[key].indexOf('../') == 0) {
                    tileIds[key] = tileIds[key].substr(3);
                }
            }
        }

        // This is odd that we need world in order to just
        // create object. This is such that those objects have a hook
        // in world in order to add themselves dynamically. 
        // ::: can I just leave world to be null for this case?
        let factory = new ObjectFactory(world);

        let elems = new Set();
        for (let layer of tiledLevelJSON.layers) {
            for (let i = 0; i < layer.data.length; ++i) {
                if (layer.data[i] != 0) {
                    let id = layer.data[i] - 1;
                    let ele = factory.buildFromName(tileIds[id]);
                    let x = i % width;
                    let y = height - Math.floor(i / width) - 1;
                    ele.x = x * tileWidth;
                    ele.y = y * tileHeight;

                    if (ele.y < 0) {
                        throw "ele.y < 0";
                    }

                    elems.add(ele);
                }
            }
        }

        let level = new Level();
        level.objects = elems;

        level.backgroundColor = 0x000000;

        let v = tiledLevelJSON.backgroundcolor;
        if(v!=null){
            let rgb = parseInt('0x'+v.substring(1,3))*256*256 + parseInt('0x'+v.substring(3,5))*256 + parseInt('0x'+v.substring(5,7));
            level.backgroundColor = rgb;
        }
        return level;
    }
}
