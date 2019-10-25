class Constants {

    zoomLevel() {
        return 4;
    }

    blockSize() {
        return 16;
    }

    // In game coordinates, the actualy number of pixel
    // on screen is the number without the division.
    // [width, height]
    logicalScreenSize() {
        let zoom = this.zoomLevel();
        return [1000 / zoom, 800 / zoom];
    }

    isUnitTests() {
        return false;
    }
}