#!/bin/bash

OLD_BASE='<base href="/">'
NEW_BASE='<base href="./">'
sed "s|$OLD_BASE|$NEW_BASE|g" ./dist/index.html > ./dist/index.tmp

# Replace the index.html with the generated file
rm ./dist/index.html
mv ./dist/index.tmp ./dist/index.html
