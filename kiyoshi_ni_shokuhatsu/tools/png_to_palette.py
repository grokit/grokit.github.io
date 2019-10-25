#!/usr/bin/python3
"""
 
# Links

- https://stackoverflow.com/questions/31386096/importing-png-files-into-numpy
"""

import scipy
import scipy.misc
import sys

def load_gimp_palette(filename):
    """
    For simplicity's sake, a palette is just an array of RGB values:
    palette = [
        [r,g,b],
        [r,g,b],
        ...
        ]
    """
    lines = open(filename, 'r').readlines()

    palette = []
    for line in lines:

        if '#' in line:
            line = line.split('#')[1]

            try:
                r = int('0x'+line[0:2], 0)
                g = int('0x'+line[2:4], 0)
                b = int('0x'+line[4:6], 0)

                rgb = [r,g,b]
                palette.append(rgb)
            except:
                #print('Ignore %s' % line)
                pass

    return palette

def filter_to_red(rgba):
    return [rgba[0], 0, 0, rgba[3]]

def filter_to_closest_in_palette(rgba, palette):
    best = None
    dist = 1e9
    for prgb in palette:
        assert len(prgb) == 3
        diff = abs(rgba[0]-prgb[0]) + abs(rgba[1]-prgb[1]) + abs(rgba[2]-prgb[2])
        if diff < dist:
            dist = diff
            best = prgb[:]

    # rgba[3] is transparency, which we don't touch.
    best.append(rgba.tolist()[3])
    return best

img_file = './test_input.png'
if len(sys.argv) >= 2:
    img_file = sys.argv[1]

# Expected format:
# #0080fc
# ...
# This is the format using Gimp -> export as .txt.
palette = load_gimp_palette('./palette.txt')

img = scipy.misc.imread(img_file)
for i in range(len(img)):
    for j in range(len(img[i])):
        rgba = img[i][j]
        #print('Bef: %s' % rgba)
        rgba = filter_to_closest_in_palette(rgba, palette)
        #print('Aft: %s' % rgba)
        img[i][j] = rgba

scipy.misc.imsave(img_file.replace('input', 'output'), img)
#scipy.misc.imsave('xxx_'+img_file, img)

