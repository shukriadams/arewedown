set -e



mkdir -p  ./public/css
mkdir -p  ./public/js

VERSION="0.0.13"

curl -L https://github.com/shukriadams/bootstrip/releases/download/$VERSION/bootstrip.js --output ./public/js/bootstrip.js
curl -L https://github.com/shukriadams/bootstrip/releases/download/$VERSION/bootstrip.css --output ./public/css/bootstrip.css
curl -L https://github.com/shukriadams/bootstrip/releases/download/$VERSION/bootstrip-theme-default.css --output ./public/css/bootstrip-theme-default.css
curl -L https://github.com/shukriadams/bootstrip/releases/download/$VERSION/bootstrip-theme-darkmoon.css --output ./public/css/bootstrip-theme-darkmoon.css 