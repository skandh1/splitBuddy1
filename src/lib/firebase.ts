import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDb1BohrtF-EcACRAMjTbltuK1obelPxxY",
  authDomain: "splitbuddy-1c233.firebaseapp.com",
  projectId: "splitbuddy-1c233",
  storageBucket: "splitbuddy-1c233.firebasestorage.app",
  messagingSenderId: "1054435047522",
  appId: "1:1054435047522:web:d827eae387bc663100793b",
  measurementId: "G-MGFG29697C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);