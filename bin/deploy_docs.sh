#!/usr/bin/env sh

# abort on errors
set -e

yarn build-docs
# cd site

# build
# yarn build

# navigate into the build output directory
cd site/src/.vuepress/dist

# if you are deploying to a custom domain
echo 'altair.sirmuel.design' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:altair-graphql/altair.git master:gh-pages

cd -
