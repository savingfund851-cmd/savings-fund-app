import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAHzImH6vzc3OnESwYs4--HjRRo87vU3w",
  authDomain: "savings-fund-c663e.firebaseapp.com",
  projectId: "savings-fund-c663e",
  storageBucket: "savings-fund-c663e.firebasestorage.app",
  messagingSenderId: "889259554301",
  appId: "1:889259554301:web:48bdef2983c3c29a865594"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
