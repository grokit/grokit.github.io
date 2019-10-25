// This class is autogenerated by tools/autogen_res.py. :::
class AssetsList {

    constructor() {
        this._assets = null;
        this._console = Factory.getConsole();
    }

    _sleep(ms) {
        return new Promise(waitFn => setTimeout(waitFn, ms));
    }

    async loadAll() {
        let expectLoad = 0;

        this._assets = new Map();
        for (let asset of this.listAssets()) {
            let filename = Utils.fullpathToFilename(asset);

            if (filename.substr(filename.length - 4) == '.png') {
                expectLoad += 1;
                let img = new Image();
                img.src = asset;

                let assets = this._assets;
                img.onload = function() {
                    assets.set(filename, img);
                }
            } else if (filename.substr(filename.length - 5) == '.json') {
                expectLoad += 1;
                let xmlHttpRequest = new XMLHttpRequest();
                xmlHttpRequest.open('GET', asset, true);

                let assets = this._assets;
                xmlHttpRequest.onreadystatechange = function(e) {
                    // status == 0 happens when testing from local .html files.
                    if (this.readyState == 4 && (this.status == 200 || this.status == 0)) {
                        let data = this.responseText;
                        assets.set(filename, data);
                    }
                }
                xmlHttpRequest.send();
            } else if (filename.substr(filename.length - 4) == '.ogg') {
                // ::: load ogg same as image files...
                this._console.info('Skipping ' + filename);
            } else {
                throw new Error("Asset type not handled: " + asset);
            }
        }

        while (!(expectLoad == this._assets.size)) {
            await this._sleep(100);
        }
    }

    // Expect filename without path, e.g.: `hero.png`.
    //
    // We don't allow two assets of same name in different
    // folders.
    get(filename) {
        if (this._assets == null) {
            throw new Error("Assets not loaded. Did you forget to call loadAll()?");
        }

        if (!this._assets.has(filename)) {
            throw new Error("Asset not found: " + filename);
        }

        return this._assets.get(filename);
    }

    listAssets() {
        let assets = new Array();
// Reflect assets START.
assets.push('./gfx/monsters/OBCitizenGeneric_Walk.png');
assets.push('./gfx/surface/ground_lr.png');
assets.push('./gfx/surface/ground_lr2.png');
assets.push('./gfx/OBElevator.png');
assets.push('./gfx/surface/block_pushable.png');
assets.push('./gfx/surface/block_fall_on_touch.png');
assets.push('./gfx/decoration/elevator_shaft.png');
assets.push('./gfx/surface/block_fall_on_touch_damaged.png');
assets.push('./levels/ut_measure_fps_with_balls.json');
assets.push('./gfx/misc/fireball_small.png');
assets.push('./levels/earthquake_building.json');
assets.push('./gfx/decoration/plant_tall.png');
assets.push('./gfx/surface/block_falling_yellow.png');
assets.push('./gfx/surface/wall_blue_top.png');
assets.push('./gfx/traps/OBSpikeCeiling.png');
assets.push('./gfx/decoration/explosion_small.png');
assets.push('./audio/sfx/jump_long.ogg');
assets.push('./gfx/hero/OBHero_Dead.png');
assets.push('./gfx/OBInvisibleMarker.png');
assets.push('./gfx/traps/OBSpikeCeilingFalling.png');
assets.push('./tools/test_input.png');
assets.push('./gfx/misc/spring_jump_up_extended.png');
assets.push('./gfx/hero/OBHero_Jump.png');
assets.push('./gfx/OBBall.png');
assets.push('./gfx/decoration/elevator_electrocuted.png');
assets.push('./gfx/surface/wall_blue_mid.png');
assets.push('./gfx/surface/ground_gray_brick.png');
assets.push('./levels/level_00.json');
assets.push('./gfx/surface/ground.png');
assets.push('./gfx/OBFireball.png');
assets.push('./gfx/misc/doggy.png');
assets.push('./gfx/hero/OBHero.png');
assets.push('./gfx/traps/OBSpikeFloorRaising.png');
assets.push('./gfx/misc/button_floor.png');
assets.push('./gfx/misc/star_yellow.png');
assets.push('./gfx/surface/block_fall_on_touch_damaged_02.png');
assets.push('./gfx/monsters/OBCitizenGeneric_Dead.png');
assets.push('./gfx/OBFireSource.png');
assets.push('./gfx/monsters/OBCitizenGeneric.png');
assets.push('./gfx/misc/button_floor_pressed.png');
assets.push('./gfx/decoration/brick_gray_bg.png');
assets.push('./gfx/surface/ground_gray_brick_full.png');
assets.push('./audio/sfx/jump.ogg');
assets.push('./gfx/misc/vampire_wannabe.png');
assets.push('./tools/test_output.png');
assets.push('./gfx/misc/spring_jump_up.png');
// Reflect assets END.
        return assets;
    }
}