#!/usr/bin/python3

import dcore.env_setup as env_setup

import glob
import os

def gen_generic_objects():
    files = list(glob.iglob('.' + '/**/*.**', recursive=True))
    exts = ['.js']
    files = [os.path.splitext(os.path.split(f)[1])[0] for f in files if os.path.splitext(f)[1] in exts and os.path.split(f)[1][0:2] == 'OB'] 

    files = set(files)

    tagBegin = '// Reflect objects START.'
    tagEnd = '// Reflect objects END.'
    template = 'objs.push( function(){return new __file__();});'

    insert = [template.replace('__file__', f) for f in files]
    insert = "\n".join(insert)

    env_setup.updateFileContentBetweenMarks('./src/objects/ObjectFactory.js', tagBegin, tagEnd, insert, False)

def gen_surfaces():
    files = list(glob.iglob('.' + '/**/*.**', recursive=True))
    exts = ['.png']
    files = [os.path.split(f)[1] for f in files if '/surface/' in f] 
    files = [f for f in files if os.path.splitext(f)[1] in exts] 

    tagBegin = '// Reflect objects category: surface START.'
    tagEnd = '// Reflect objects category: surface END.'

    template = 'this._filesMappingToThis.add("__file__");'

    insert = [template.replace('__file__', f) for f in files]
    insert = "\n".join(insert)

    env_setup.updateFileContentBetweenMarks('./src/objects/OBSurface.js', tagBegin, tagEnd, insert, False)

if __name__ == '__main__':
    gen_generic_objects()
    gen_surfaces()
