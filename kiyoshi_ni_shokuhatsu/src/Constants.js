class Constants {

    zoomLevel() {
        return 4;
    }

    blockSize() {
        return 16;
    }

    isDebug(){
        return false;
    }

    startLevelFilename(){
        if(!this.isDebug()){
        return 'through_town.json';
        }else{
        //return 'ut_measure_fps_with_balls.json';
        return 'earthquake_building.json';
        //return 'through_town.json';
        }
    }

    transitionTimeMs(){
        if(this.isDebug()){
            return 0;
        }else{
            return 7500;
        }
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
