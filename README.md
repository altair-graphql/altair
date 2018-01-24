[![Build](https://travis-ci.org/imolorhe/altair.svg?branch=master "Travis CI")](https://travis-ci.org/imolorhe/altair)
[![Build status](https://ci.appveyor.com/api/projects/status/qp69kxnlxntsumdj/branch/staging?svg=true)](https://ci.appveyor.com/project/imolorhe/altair/branch/staging)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/d/flnheeellpciglgpaodhkhmapeljopja.svg)](https://chrome.google.com/webstore/detail/altair-graphql-client/flnheeellpciglgpaodhkhmapeljopja)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/flnheeellpciglgpaodhkhmapeljopja.svg)](https://chrome.google.com/webstore/detail/altair-graphql-client/flnheeellpciglgpaodhkhmapeljopja)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/rating/flnheeellpciglgpaodhkhmapeljopja.svg)](https://chrome.google.com/webstore/detail/altair-graphql-client/flnheeellpciglgpaodhkhmapeljopja)
[![Mozilla Add-on](https://img.shields.io/amo/v/altair-graphql-client.svg)](https://addons.mozilla.org/en-US/firefox/addon/altair-graphql-client/)
[![Gitter](https://img.shields.io/gitter/room/altair-graphql/Lobby.svg)](https://gitter.im/altair-graphql/Lobby)
[![GitHub release](https://img.shields.io/github/release/imolorhe/altair.svg)](https://github.com/imolorhe/altair/releases)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fimolorhe%2Faltair.svg?type=shield)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fimolorhe%2Faltair?ref=badge_shield)

![Maintenance](https://img.shields.io/maintenance/yes/2018.svg)

![altair logo](src/assets/img/altair_logo_128.png "Altair GraphQL Client")


![set url](src/assets/img/readme/set-url.gif "Altair GraphQL Client")
![add fragment](src/assets/img/readme/add-fragment.gif "Altair GraphQL Client")

# Altair GraphQL Client

A graphQL client for making graphQL queries to a graphQL server - Postman for GraphQL.

<!-- Web app: https://altair-gql.herokuapp.com/ -->

There's a [chrome extension](https://chrome.google.com/webstore/detail/altair-graphql-client/flnheeellpciglgpaodhkhmapeljopja) and a [firefox add-on](https://addons.mozilla.org/en-US/firefox/addon/altair-graphql-client/).

There are apps for [mac, windows and linux users](https://github.com/imolorhe/altair/releases/latest) as well.

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Generate chrome extension files

Run `npm run build-ext` to build the chrome extension files. The extension files will be stored in the `chrome-extension/` directory.

## Generate electron app

Run `npm run build-electron` to build the electron apps. The apps will be stored in the `electron-builds/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on working with the project, check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Deploying

- Make sure your local repo is up to date `git pull`
- Run tests locally `ng test --single-run && ng lint && ng e2e`
- Build extensions locally `yarn build-ext`
- Verify that extensions (chrome and firefox) are working properly 
- Verify chrome extension https://developer.chrome.com/extensions/getstarted#unpacked
- Verify firefox extension `./bin/run_ext_firefox.sh`
- Update extension version `./bin/update_version.sh <version_number e.g. 1.6.1>`
- Create commit, push and update local repo `git add --all && git commit -am "Upgraded to v<version_number>" && git pull && git push`
- Create release tag for the new version `git tag v<version_number>`
- Push new tag `git push --tags`
- Create release notes (Using https://www.npmjs.com/package/release) `release`
- Wait till all the CI builds are completed, and the binaries have been published in [Github release](https://help.github.com/articles/creating-releases/)
- Merge the staging branch to master
- Upload updated browser extensions
- C'est fini.

In the case of an error while deploying, delete the release tags locally and remotely using `git tag --delete <tag> && git push --delete origin <tag>`

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
6. See anything that needs improving, create an issue.

## Credits

This project was built using [Angular](https://angular.io/), an awesome opensource project from the folks at [Google](https://www.google.com).

The desktop apps were built using [electron](https://electron.atom.io/), another awesome opensource project from the folks at [github](http://www.github.com/).

In case I missed out any other projects, do let me know :)


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fimolorhe%2Faltair.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fimolorhe%2Faltair?ref=badge_large)
