// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-G9mKz8I6CwYUGpt0D7qC06RWpTDkpDU",
  authDomain: "luna-5dac7.firebaseapp.com",
  projectId: "luna-5dac7",
  storageBucket: "luna-5dac7.firebasestorage.app",
  messagingSenderId: "763951716900",
  appId: "1:763951716900:web:347744c43da40bc58996b1",
  measurementId: "G-R79KBY5NV7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics };
export default app;
