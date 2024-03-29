import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-auth-app-c9857.firebaseapp.com",
  projectId: "mern-auth-app-c9857",
  storageBucket: "mern-auth-app-c9857.appspot.com",
  messagingSenderId: "848575718123",
  appId: "1:848575718123:web:9726931d50b5fc0d9594ae",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
