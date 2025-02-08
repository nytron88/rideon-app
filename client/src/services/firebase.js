import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import config from "../config/config";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export const storage = getStorage(app);

export let analytics;
if (typeof window !== "undefined" && navigator.onLine) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn(
      "Analytics initialization skipped due to offline mode:",
      error.message
    );
  }
}