#!/bin/bash

lerna bootstrap
# lerna publish from-git --force-publish=* --yes
lerna publish from-git --force-publish=* --yes --skip-npm --skip-git
