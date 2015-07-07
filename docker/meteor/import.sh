#!/bin/bash
rm -rf bundle
cd ../../app
demeteorizer -o ../docker/meteor/bundle -a eportfolio
cd -
