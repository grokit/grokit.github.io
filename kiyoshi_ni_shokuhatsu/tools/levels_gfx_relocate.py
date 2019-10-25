"""
If files have been moved such that Tiled does not find 
the resources anymore, find those files and re-link
them.
"""

import re
import glob
import os

def getImages():
    files = list(glob.iglob('.' + '/**/*.**', recursive=True))
    exts = ['.png']
    files = [f for f in files if os.path.splitext(f)[1] in exts] 
    assert len(files) == len(set(files))
    return set(files)

if __name__ == '__main__':

    imMap = {}
    for im in getImages():
        imMap[os.path.split(im)[1]] = im

    out = []
    pattern = '"image":"(.*?)"'
    for line in open('levels/earthquake_building.json').readlines(): 
        m = re.search(pattern, line)
        if m is not None:
            found = m.group(1)
            found = os.path.split(found)[1]
            line = '"image": ".%s",\n' % imMap[found]
        out.append(line)

    open('levels/earthquake_building.json', 'w').write("".join(out))



