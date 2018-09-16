var priv_Console_LastCoutMs = Date.now() / 1000;
var priv_Console_n = 0;

class Console {

    // Return: true: should log.
    static _tick() {

        if (Date.now() / 1000 - priv_Console_LastCoutMs > 0.0050) {
            priv_Console_LastCoutMs = Date.now() / 1000;
            return true;
        }

        priv_Console_n++;
        if (priv_Console_n < 0.5 * 1000) {
            return true;
        }

        if (priv_Console_n == 0.5 * 1000) {
            console.warn("Suppressing console output. Further results may not be accurate.");
        }

        return false;
    }

    static debug(txt) {
        if (Console._tick()) {
            console.log(txt);
        }
    }

    static log(txt) {
        return Console.debug(txt);
    }
}