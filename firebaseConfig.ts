import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration.
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey: "AIzaSyDJNAn_RXQCw0HwuPBy0bP72jxofgTG7Sk",
    authDomain: "payments-e2891.firebaseapp.com",
    projectId: "payments-e2891",
    storageBucket: "payments-e2891.firebasestorage.app",
    messagingSenderId: "72424937616",
    appId: "1:72424937616:web:5abf739ea8860e86742015",
    measurementId: "G-X1QYES8RG0"
  };

// Add a check for placeholder values.
export const isFirebaseConfigValid = firebaseConfig.apiKey !== "YOUR_API_KEY";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);