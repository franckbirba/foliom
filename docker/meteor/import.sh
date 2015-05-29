#!/bin/bash
rm -rf bundle app.tar.gz
mkdir bundle
cd ../../app
meteor build --architecture os.linux.x86_64 ../docker/meteor/bundle/
cd -
cd bundle
tar xzvf app.tar.gz
