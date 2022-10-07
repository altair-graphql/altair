## Development

Run `yarn` from the root of the repository to install dependencies.
Run `yarn start:app` to start the local dev server of the web app. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

### Generate chrome extension files

Run `yarn build-ext` to build the chrome extension files. The extension files will be stored in the `chrome-extension/` directory.

### Generate electron app

Run `yarn build-electron` to build the electron apps. The apps will be stored in the `electron-builds/` directory.

### Updating docs

Run `bundle exec jekyll serve`.

### Running tests

Run `yarn test` to execute tests across all packages.
