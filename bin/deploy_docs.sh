#!/usr/bin/env sh

# abort on errors
set -e

pnpm install

# build
# pnpm build

# navigate into the build output directory
cd packages/altair-docs/.vitepress/dist

echo "Update for cloudflare pages deploy"
exit 1
# if you are deploying to a custom domain
# echo 'altairgraphql.dev' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:altair-graphql/altair.git master:gh-pages

cd -
