import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBDoUx46DBpPE6KCN5dh1qCqcBV86hgfAM",
  authDomain: "spectral-a59ca.firebaseapp.com",
  databaseURL: "https://spectral-a59ca-default-rtdb.firebaseio.com",
  projectId: "spectral-a59ca",
  storageBucket: "spectral-a59ca.firebasestorage.app",
  messagingSenderId: "611795613437",
  appId: "1:611795613437:web:dff876537d3c9ee1283094",
  measurementId: "G-CQPRY474JP"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
