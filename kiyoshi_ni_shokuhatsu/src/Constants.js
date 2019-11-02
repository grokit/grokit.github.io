class Constants {

    zoomLevel() {
        return 4;
    }

    blockSize() {
        return 16;
    }

    isDebug() {
        return false;
    }

    startLevelFilename() {
        if (!this.isDebug()) {
            return 'through_town.json';
        } else {
            //return 'ut_measure_fps_with_balls.json';
            //return 'earthquake_building.json';
            //return 'through_town.json';
            return 'through_town_02.json';
        }
    }

    transitionTimeMs() {
        if (this.isDebug()) {
            return 0;
        } else {
            return 7500;
        }
    }

    gamepadSupport(){
        return false;
    }

    // In game coordinates, the actualy number of pixel
    // on screen is the number without the division.
    // [width, height]
    logicalScreenSize() {
        //let ratio = 16/9;
        let ratio =  window.screen.width /  window.screen.height;
        let width = 1024;
        let zoom = this.zoomLevel();
        return [width / zoom, width / (ratio*zoom)];
    }

    isUnitTests() {
        return false;
    }
}
