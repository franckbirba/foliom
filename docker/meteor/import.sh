#!/bin/bash
rm -rf bundle app.tar.gz
cd ../../app
meteor build --architecture os.linux.x86_64 ../docker/meteor/
cd -
tar xzvf app.tar.gz
rm -rf app.tar.gz
