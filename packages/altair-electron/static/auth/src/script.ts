// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA6Tr4NsR5PicUyOfNXpXIKXdyXnL-XX6E",
  authDomain: "altair-gql.firebaseapp.com",
  databaseURL: "https://altair-gql.firebaseio.com",
  projectId: "altair-gql",
  storageBucket: "altair-gql.appspot.com",
  messagingSenderId: "584169952184",
  appId: "1:584169952184:web:8884e50761ca87622c754d",
  measurementId: "G-3YZQC3YW7T",
};

const firebaseDomain = () =>
  `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net`;
const init = async () => {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const result = await getRedirectResult(auth);
  if (!result) {
    const provider = new GoogleAuthProvider();
    return signInWithRedirect(auth, provider);
  }

  const token = await result.user.getIdToken();

  const response = await fetch(`${firebaseDomain()}/api/token`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id_token: token }),
  });
  const json = await response.json();
  console.log(json);

  if (json.status === "success") {
    await sendToken(json.auth_token);
  }

  document.body.innerText = "You can now close this window.";

  try {
    window.close();
  } catch {}
};

const sendToken = async (token: string) => {
  const params = new URLSearchParams(window.location.search);
  const res = await fetch("/callback", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, nonce: params.get("nonce") }),
  });
};

init();
