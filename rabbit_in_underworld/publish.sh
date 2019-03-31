pushd .
find . | grep swp$ | xargs rm
mkdir ~/pubgame
rm -rf ~/pubgame/latest
cp -r ./ ~/pubgame/latest
rm -rf ~/pubgame/latest/.git
#ssh 35.238.167.8 'rm -rf ~/public/latest'
#scp -r ~/pubgame/latest 35.238.167.8:~/public/latest
cd ~/pubgame/latest
7z a latest.zip
mv latest.zip ..
cd ..
rm -rf ~/pubgame/latest
popd
