. cd2d
rm -rf ~/Downloads/latest
cp -r ../ ~/Downloads/latest
rm -rf ~/Downloads/latest/.git
ssh 35.238.167.8 'rm -rf ~/public/latest'
scp -r ~/Downloads/latest 35.238.167.8:~/public/latest
