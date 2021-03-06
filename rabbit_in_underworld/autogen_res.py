#!/usr/bin/python3
jsSrc = """
// This class is autogenerated by __file__.
class AssetsList
{
    // Autogen'ed ... don't touch.
    static listGfx(){
        let assets = new Array();
__insert__
        return assets;
    }

    // Not Autogen'ed. Manually edit from .py file.
    //
    // Do not load with game, just load as go since bigger and game
    // can start without music.
    static listMusic() {
        let music = new Array();

        music.push('sounds/music/incompetech/delightful_d.ogg');
        music.push('sounds/music/incompetech/twisting.ogg'); // Moody, good for cave.
        music.push('sounds/music/incompetech/pookatori_and_friends.ogg');
        music.push('sounds/music/incompetech/getting_it_done.ogg');
        music.push('sounds/music/incompetech/robobozo.ogg');
        music.push('sounds/music/incompetech/balloon_game.ogg');
        music.push('sounds/music/incompetech/cold_sober.ogg');
        music.push('sounds/music/incompetech/salty_ditty.ogg');
        music.push('sounds/music/incompetech/townie_loop.ogg'); // Very peaceful, flute.
        music.push('sounds/music/incompetech/mega_hyper_ultrastorm.ogg'); // Super energetic. Maybe for special.
        // Legacy
        music.push('sounds/music/music_peaceful_contemplative_starling.ogg');
        music.push('sounds/music/twinmusicom_8_bit_march.ogg');
        music.push('sounds/music/twinmusicom_nes_overworld.ogg');
        music.push('sounds/music/music_juhanijunkala_chiptune_01.ogg');

        return music;
    }

    // Not autogenerated.
    static listLevels(){
        let levels = new Array();
        if (Constants.isDebug()) {
            levels.push('levels/gorilla.json');
        } else {
            levels.push('levels/l_00_rabbit_in_house.json');
            levels.push('levels/l_01.json');
            levels.push('levels/l_02.json');
            levels.push('levels/l_02_vampire_weekend.json');
            levels.push('levels/l_03.json');
            levels.push('levels/l_04.json');
            levels.push('levels/l_05.json');
            levels.push('levels/l_99_rabbit_in_safe_house.json');
        }

        return levels;
    }
}
""".replace('__file__', __file__)

import json
import os 

line = '        assets.push("__item__");'

dirs = ['./gfx', './levels']
exts = ['.png', '.json']

resList = []
for dr in dirs:
    resList += [os.path.join(dr, f) for f in os.listdir(dr) if len(f) >= 4 and '.' in f and '.' + f.split('.')[-1] in exts]
    
# Remove './' prefix.
resList = [f.split('./')[1] for f in resList]

lines = []
for res in resList:
    lines.append(line.replace('__item__', res))

data = jsSrc.replace('__insert__', "\n".join(lines))
open('./src/AssetsList.js','w').write(data)

