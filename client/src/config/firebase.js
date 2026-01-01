import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvFs8qcJDD8T9QaiKclHUykiKnh6RvcMo",
  authDomain: "qawaam-dd972.firebaseapp.com",
  projectId: "qawaam-dd972",
  storageBucket: "qawaam-dd972.firebasestorage.app",
  messagingSenderId: "78805342126",
  appId: "1:78805342126:web:e267d8e25c128dc50e5a3f",
  measurementId: "G-B2F3HK5YNL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
