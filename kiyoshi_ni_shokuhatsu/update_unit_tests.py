#!/usr/bin/python3
"""
Update list of unit-tests.
"""

import dcore.env_setup as env_setup

import glob
import os

def getScriptsFilenames():
    files = list(glob.iglob('.' + '/**/*.**', recursive=True))
    files = [f for f in files if f[-3:] == '.js' and os.path.basename(f)[0:2] == 'UT']
    return set(files)

def gen(utFiles):
    """
    E.g.:
    {'./src/unit_tests/UTObjTTLExpireGetsRemoved.js', 
     './src/unit_tests/UTFallOffScreenGetsDestroyed.js', 
     './src/unit_tests/UTBasicTick.js'}
    """
    tagBegin = '// REFLECTION: Unit-Test list BEGIN.'
    tagEnd = '// REFLECTION: Unit-Test list END.'
    template = 'this._tests.push(new __file__());'

    insert = [template.replace('__file__', os.path.basename(f)[0:-3]) for f in utFiles]
    insert = "\n".join(insert)

    env_setup.updateFileContentBetweenMarks('./src/unit_tests/UnitTests.js', tagBegin, tagEnd, insert, False)

if __name__ == '__main__':
    scripts = getScriptsFilenames()
    gen(scripts)
