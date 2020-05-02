
## Deploying

- Check docs are up to date (settings options, pre request script API, supported languages)
- Make sure your local repo is up to date `git pull`
- Run tests locally `ng test --single-run && ng lint && ng e2e`
- Update extension version `./bin/update_version.sh <version_number e.g. 1.6.1>`
- Build extensions locally `yarn build-ext`
- Verify that extensions (chrome and firefox) are working properly 
  - Verify chrome extension https://developer.chrome.com/extensions/getstarted#unpacked
  - Verify firefox extension `./bin/run_ext_firefox.sh`
- Create commit, push and update local repo `git add --all && git commit -am "Upgraded to v<version_number>" && git pull && git push`
- Create an annotated release tag for the new version `./bin/create_tag.sh v<version_number>`
- Push new tag `git push --tags`
- Create release notes (Using https://www.npmjs.com/package/release) `release`
- Wait till all the CI builds are completed, and the binaries have been published in [Github release](https://help.github.com/articles/creating-releases/)
- Merge the staging branch to master
- Upload updated browser extensions
- C'est fini.

In the case of an error while deploying, delete the release tags locally and remotely using `./bin/delete_tag.sh <tag>`
