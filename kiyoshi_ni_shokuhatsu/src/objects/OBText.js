class OBText extends GameObjectBase {
    constructor(x, y, text) {
        super(x, y);
        this.text = text;
        this.traits.remove('moveable');
        this.size = 4;
        this.color = "#ffffff";
    }

    tick() {}

    setText(text) {
        this.text = text;
    }

    setSize(size) {
        this.size = size;
    }

    setColor(color) {
        this.color = color;
    }
}