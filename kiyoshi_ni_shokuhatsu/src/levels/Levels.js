class Level {}

class Levels {
    constructor() {
        this._objectFactory = Factory.getObjectFactory();
        this._assetsList = Factory.getAssetsList();
        this._console = Factory.getConsole();
    }

    loadLevelFromAssetName(name, world) {
        let tiledLevelJSON = JSON.parse(this._assetsList.get(name));
        let level = this._loadLevel(tiledLevelJSON, world);
        for (let obj of level.objects) {
            world.addObject(obj);
        }
    }

    /**
     * Loads json tiled (https://www.mapeditor.org/) level.
     * Docs: https://doc.mapeditor.org/en/stable/reference/json-map-format/
     */
    _loadLevel(tiledLevelJSON) {
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

        let elems = new Set();
        let layerId = 0;
        for (let layer of tiledLevelJSON.layers) {
            this._console.trace('load layer ' + layer.name);
            if (layer.type == 'tilelayer') {
                for (let i = 0; i < layer.data.length; ++i) {

                    let layerTags = new Set(); // GameObject type.
                    if (layer.properties != undefined && layer.properties.tags != undefined) {
                        layerTags = new Set(layer.properties.tags.split(','));
                    }

                    if (layer.data[i] != 0) {
                        let id = layer.data[i] - 1;
                        let filename = Utils.fullpathToFilename(tileIds[id]);
                        let ele = this._objectFactory.buildFromName(filename, layerId);
                        let x = i % width;
                        let y = height - Math.floor(i / width) - 1;
                        ele.x = x * tileWidth;
                        ele.y = y * tileHeight;

                        if (ele.y < 0) {
                            throw "ele.y < 0";
                        }

                        if (layerTags.has('background')) {
                            ele.traits.addTraitGeneric('background');
                        }

                        this._console.trace('adding ' + filename);

                        elems.add(ele);
                    }
                }
            } else if (layer.type == 'objectgroup') {
                // We don't make a distinction in the engine between tiles and
                // objects. The only difference is that object can have custom 
                // properties (and Tiled author has no intention to add props
                // for tiles).
                //
                // So tiles are objects constructed with default options, and objects
                // allow to have properties that customize those objects.

                for (let obj of layer.objects) {
                    let id = obj.gid - 1;
                    let filename = Utils.fullpathToFilename(tileIds[id]);
                    // obj.properties is just kvp JSON bag that can be defined in Tiled's UI.
                    let ele = this._objectFactory.buildFromName(filename, layerId, obj.properties);
                    ele.x = obj.x;
                    ele.y = height * tileHeight - obj.y;

                    if (ele.y < 0) {
                        throw "ele.y < 0";
                    }

                    elems.add(ele);
                }
            }

            layerId += 1;
        }

        let level = new Level();
        level.objects = elems;

        level.backgroundColor = 0x000000;

        let v = tiledLevelJSON.backgroundcolor;
        if (v != null) {
            let rgb =
                parseInt('0x' + v.substring(1, 3)) * 256 * 256 +
                parseInt('0x' + v.substring(3, 5)) * 256 +
                parseInt('0x' + v.substring(5, 7));

            level.backgroundColor = rgb;
        }

        return level;
    }
}