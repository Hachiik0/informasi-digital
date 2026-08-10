import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWLYjXO_EQCXN0qXR99RsB2vRy47YunFc",
  authDomain: "papan-info-tv.firebaseapp.com",
  projectId: "papan-info-tv",
  storageBucket: "papan-info-tv.firebasestorage.app",
  messagingSenderId: "886474165326",
  appId: "1:886474165326:web:818b2a03c02d95e058471f",
  measurementId: "G-9YSY0ZF17Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);