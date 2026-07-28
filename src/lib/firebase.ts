import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASZup8rGHMlvzwCx0Ykjbcc-HWGw_QZYA",
  authDomain: "solutionfied.firebaseapp.com",
  projectId: "solutionfied",
  storageBucket: "solutionfied.firebasestorage.app",
  messagingSenderId: "619009885012",
  appId: "1:619009885012:web:4429fb954a7ee021953ec1",
  measurementId: "G-B07XZZZB5W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

