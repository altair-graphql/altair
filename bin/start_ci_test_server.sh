#!/bin/bash

pwd
cd ..
git clone --depth=1 https://github.com/XKojiMedia/ezio-tester.git
cd ezio-tester
yarn
yarn dev &
# pwd