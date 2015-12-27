#!/usr/bin/env bash

# Create the Chrome extension
rm -f github-selfies-chrome.zip
pushd chrome
zip ../github-selfies-chrome.zip *
popd

# Create the Firefox extension
which node || (echo "You need to install NodeJS!" && exit)
which jpm || (echo "You need to install JPM! (npm install -g jpm)" && exit)
rm -f github-selfies-firefox.xpi
pushd firefox
jpm xpi
popd
mv firefox/*.xpi github-selfies-firefox.xpi
