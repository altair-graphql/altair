import pkg from '../../package.json';

export const environment = {
  production: true,
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
