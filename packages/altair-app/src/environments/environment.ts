// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import pkg from '../../package.json';

export const environment = {
  production: false,
  version: pkg.version,
  serverReady: true,
  firebaseConfig: {
    apiKey: 'AIzaSyA6Tr4NsR5PicUyOfNXpXIKXdyXnL-XX6E',
    authDomain: 'altair-gql.firebaseapp.com',
    databaseURL: 'https://altair-gql.firebaseio.com',
    projectId: 'altair-gql',
    storageBucket: 'altair-gql.appspot.com',
    messagingSenderId: '584169952184',
    appId: '1:584169952184:web:8884e50761ca87622c754d',
  },
};
