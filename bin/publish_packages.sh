#!/bin/bash

git checkout staging
lerna bootstrap
lerna publish from-package --force-publish=* --no-git-tag-version --no-push --yes
