#!/bin/bash

rm -rf chrome-extension
mkdir chrome-extension
cp -r dist/* chrome-extension
cp -r chrome-ext-files/* chrome-extension