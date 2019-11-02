class OBSurface extends GameObjectBase {
    constructor(x, y) {
        super(x, y);

        this.traits.addTraitGeneric('surface', -1);
        this.traits.remove('moveable');
        this.zIndex = 35;

        // Reflect objects category: surface START.
        this._filesMappingToThis.add("block_falling_yellow.png");
        this._filesMappingToThis.add("ground_lr.png");
        this._filesMappingToThis.add("ground_gray_brick_full.png");
        this._filesMappingToThis.add("block_fall_on_touch_damaged_02.png");
        this._filesMappingToThis.add("ground_lr2.png");
        this._filesMappingToThis.add("wall_blue_top.png");
        this._filesMappingToThis.add("block_pushable.png");
        this._filesMappingToThis.add("block_fall_on_touch.png");
        this._filesMappingToThis.add("wall_blue_mid.png");
        this._filesMappingToThis.add("ground_lr2_4x4_brown.png");
        this._filesMappingToThis.add("block_fall_on_touch_damaged.png");
        this._filesMappingToThis.add("ground_gray_brick.png");
        this._filesMappingToThis.add("ground_lr2_4x4.png");
        this._filesMappingToThis.add("OBSurface.png");
        // Reflect objects category: surface END.
    }

    tick() {}
}