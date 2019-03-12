
import os

cmd = 'oggenc -q 3 -o __out__ __in__'


files = [f for f in os.listdir('.') if f[-4:] == '.wav']

for f in files:
    c = cmd.replace('__in__', f)
    c = c.replace('__out__', f.replace('.wav', '.ogg'))
    print(c)
    os.system(c)
