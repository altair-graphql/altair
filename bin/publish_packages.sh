#!/bin/bash

git checkout staging
lerna bootstrap
lerna publish from-git --force-publish=* --yes
