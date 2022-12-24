import { FirebaseOptions } from "firebase/app";
export type ClientEnvironment = "development" | "production" | "testing";

export const getClientConfig = (
  env: ClientEnvironment = "development"
): FirebaseOptions => {
  switch (env) {
    case "production":
      return {
        apiKey: "AIzaSyA6Tr4NsR5PicUyOfNXpXIKXdyXnL-XX6E",
        authDomain: "altair-gql.firebaseapp.com",
        databaseURL: "https://altair-gql.firebaseio.com",
        projectId: "altair-gql",
        storageBucket: "altair-gql.appspot.com",
        messagingSenderId: "584169952184",
        appId: "1:584169952184:web:8884e50761ca87622c754d"
      };
  }

  // TODO: Create dev environment
  return {
    apiKey: "AIzaSyA6Tr4NsR5PicUyOfNXpXIKXdyXnL-XX6E",
    authDomain: "altair-gql.firebaseapp.com",
    databaseURL: "https://altair-gql.firebaseio.com",
    projectId: "altair-gql",
    storageBucket: "altair-gql.appspot.com",
    messagingSenderId: "584169952184",
    appId: "1:584169952184:web:8884e50761ca87622c754d"
  };
};
