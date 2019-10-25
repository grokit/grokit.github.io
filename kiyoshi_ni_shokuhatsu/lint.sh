
# sudo npm -g install js-beautify
find ./src | grep \.js$ | xargs -I@ bash -c 'js-beautify @ > _ && mv _ @'


