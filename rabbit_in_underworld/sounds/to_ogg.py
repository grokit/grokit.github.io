
import os

cmdMp3ToWav = 'ffmpeg -i __in__ __out__'
# --downmix : to mono
cmd = 'oggenc --downmix --resample 22000 -q 3 -o __out__ __in__'


files = [f for f in os.listdir('.') if f[-4:] == '.mp3']

for f in files:
    c = cmdMp3ToWav.replace('__in__', f)
    c = c.replace('__out__', f.replace('.mp3', '.wav'))
    print(c)
    os.system(c)

files = [f for f in os.listdir('.') if f[-4:] == '.wav']

for f in files:
    c = cmd.replace('__in__', f)
    c = c.replace('__out__', f.replace('.wav', '.ogg'))
    print(c)
    os.system(c)
