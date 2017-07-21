#!/bin/bash

PATTERN='"version": ".*"'
NEW_BASE='"version": "$$"'
sed -i '' "s|$OLD_BASE|$NEW_BASE|g" ./chrome-ext-files/manifest.json