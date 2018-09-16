
# important: --bind 127.0.0.1 make sure it's only accessible from local computer
# so other people on same network do not have access
python3 -m http.server 8000 --bind 127.0.0.1

#lsof -i :8000
#COMMAND   PID USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
#python3 28023 arch    4u  IPv4 4147446      0t0  TCP localhost:8000 (LISTEN)

