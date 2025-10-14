// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// *** สำคัญ: ให้เอาค่า Config จากโปรเจกต์ Firebase ของคุณมาใส่แทนที่ตรงนี้ ***
const firebaseConfig = {
  apiKey: "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "easyway-40e1b.firebaseapp.com",
  projectId: "easyway-40e1b",
  storageBucket: "easyway-40e1b.appspot.com",
  messagingSenderId: "371724947061",
  appId: "1:371724947061:web:a48a31d9cfe3138c84b23c",
  measurementId: "G-8P4J61N4GC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export a reference to the services you want to use
export const db = getFirestore(app);
export const auth = getAuth(app);
