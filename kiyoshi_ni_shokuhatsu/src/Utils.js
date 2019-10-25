class Utils {
    //  E.g.: "gfx/backgrounds/tree_blocky.png" -> "tree_blocky.png"
    static fullpathToFilename(fullpath) {
        return fullpath.substring(fullpath.lastIndexOf('/') + 1);
    }
}