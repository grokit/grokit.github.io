class CanvasRenderer {
    constructor() {
        this._constants = Factory.getConstants();
        this._camera = Factory.getCamera();
        this._backgroundColor = '#000000'
    }

    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        if (false) {
            this.ctx.alpha = false;
            this.ctx.desynchronized = false;
        }

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;

        this.screenHeight = this.canvas.height;
        this.screenWidth = this.canvas.width;
    }

    // y+
    // ^
    // |
    // |
    // ----->x+
    // Transform to up/right is + coordinate system.
    _tx(x) {
        return x;
    }

    // As above.
    _ty(y, dy) {
        return this.screenHeight - y - dy;
    }

    clear(backgroundColor) {
        this.ctx.clearRect(0, 0, this.screenWidth, this.screenHeight);
        this.ctx.fillStyle = this._backgroundColor;
        this.ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    }

    draw(obj) {
        if(obj.traits.has('TRSetBackgroundColor')){
            this._backgroundColor = obj.traits.get('TRSetBackgroundColor').color;
        }

        let scale = this._constants.zoomLevel();
        if (obj.image) {
            this.ctx.save();
            this.ctx.translate(0, -this.screenHeight * (scale - 1.0))
            this.ctx.scale(scale, scale)

            let objX = obj.x - this._camera.getX();
            let objY = obj.y - this._camera.getY();

            if (obj.flippedHorizontally || obj.flippedVertically) {
                this.ctx.translate(objX + obj.width / 2, objY + obj.height / 2);
                let fx = obj.flippedHorizontally ? -1 : 1;
                this.ctx.scale(fx, 1);
                this.ctx.translate(-(objX + obj.width / 2), -(objY + obj.height / 2));
            }

            this.ctx.drawImage(
                obj.image,
                this._tx(objX),
                this._ty(objY, obj.height),
                obj.width,
                obj.height
            );

            this.ctx.restore();
        }

        if (obj.text) {
            this.ctx.save();

            this.ctx.translate(0, -this.screenHeight * (scale - 1.0))
            this.ctx.scale(scale, scale)

            let size = obj.size * scale;
            this.ctx.font = `${size}px Arial`;
            this.ctx.fillStyle = obj.color;
            this.ctx.fillText(obj.text, this._tx(obj.x), this._ty(obj.y, obj.height));

            this.ctx.restore();
        }
    }
}
