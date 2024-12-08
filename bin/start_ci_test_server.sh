#!/bin/bash

pwd
cd ..
git clone --depth=1 https://github.com/XKojiMedia/ezio-tester.git
cd ezio-tester
pnpm
pnpm dev
# CI_TEST_SERVER_ID=$!
# pwd