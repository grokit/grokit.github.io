#!/usr/bin/python3
"""
Update list of unit-tests.
"""

import dcore.env_setup as env_setup

import glob
import os

def getScriptsFilenames():
    files = list(glob.iglob('.' + '/**/*.**', recursive=True))
    exts = ['.png', '.ogg', '.json']
    files = [f for f in files if os.path.splitext(f)[1] in exts] 
    assert len(files) == len(set(files))
    return set(files)

def gen(files):
    tagBegin = '// Reflect assets START.'
    tagEnd = '// Reflect assets END.'
    template = "assets.push('__file__');"

    insert = [template.replace('__file__', f) for f in files]
    insert = "\n".join(insert)

    print(insert)

    env_setup.updateFileContentBetweenMarks('./src/AssetsList.js', tagBegin, tagEnd, insert, False)

if __name__ == '__main__':
    scripts = getScriptsFilenames()
    gen(scripts)
