"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';
// --- Firebase Initialization ---
// --- Firebase Initialization ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, onSnapshot, addDoc, doc, setDoc, deleteDoc, where, query, updateDoc, increment, serverTimestamp, getDoc } from "firebase/firestore"; // <-- เพิ่ม getDoc
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    GoogleAuthProvider, // <-- เพิ่มอันนี้
    signInWithPopup // <-- เพิ่มอันนี้
} from "firebase/auth";

// ***** ⬇️⬇️⬇️ สำคัญมาก! คัดลอก Config ที่ถูกต้องจาก Firebase Console มาวางทับตรงนี้ทั้งหมด ⬇️⬇️⬇️ *****
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkAJ0WxSm1NbgPMHXx6MByAryRQkRxqVA",
    authDomain: "easyway-40e1b.firebaseapp.com",
    projectId: "easyway-40e1b",
    storageBucket: "easyway-40e1b.firebasestorage.app",
    messagingSenderId: "371724947061",
    appId: "1:371724947061:web:a48a31d9cfe3138c84b23c",
    measurementId: "G-8P4JG1N4GC"
    // measurementId is optional
};
// ***** ⬆️⬆️⬆️ สำคัญมาก! คัดลอก Config ที่ถูกต้องจาก Firebase Console มาวางทับตรงนี้ทั้งหมด ⬆️⬆️⬆️ *****

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
// const functions = getFunctions(app, 'us-central1'); // Assuming you revert/remove Cloud Functions for now


// --- SVG Icons ---
// ... (Previous Icons: GoogleIcon, EyeIcon, MenuIcon, SearchIcon, PlusIcon, MinusIcon, MotorcycleIcon, BusIcon, AddPinIcon, LikeIcon, SaveIcon, PriceIcon, ReviewIcon, StarIcon, ReportIcon, ImageIcon)
const TargetIcon = () => ( // <-- Updated GPS Icon
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v.01M12 20v.01M4 12h.01M20 12h.01M12 16a4 4 0 100-8 4 4 0 000 8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
);
const FullScreenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8V4m0 0h4M3 4l4 4m8-4h4m0 0v4m0-4l-4 4M3 16v4m0 0h4m-4 0l4-4m8 4h4m0 0v-4m0 4l-4-4" />
    </svg>
);
// ... (All other previous icon components remain the same) ...
const GoogleIcon = () => (<svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.612-3.87-11.188-8.864l-6.571 4.819A20 20 0 0 0 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.697 44 34.09 44 31.5c0-3.756-.768-7.297-2.109-10.552z"></path></svg>);
const EyeIcon = ({ closed }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">{closed ? (<><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></>) : (<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></>)}</svg>);
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>;
const MotorcycleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 17.5V9.5l-3.6-4.2c-.2-.2-.5-.3-.8-.3H5.5"/><path d="m8 17.5 4-4"/><path d="M8 13h4.5"/></svg>);
const BusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>);
const AddPinIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle><line x1="12" y1="7" x2="12" y2="13"></line><line x1="9" y1="10" x2="15" y2="10"></line></svg>);
const LikeIcon = ({ isLiked }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isLiked ? 'text-blue-600' : 'text-gray-700'}`} viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>);
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
const PriceIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7h5a3 3 0 0 1 0 6H8V7z"></path><path d="M8 13h5a3 3 0 0 1 0 6H8v-6z"></path><path d="M12 4v16"></path></svg>);
const ReviewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const StarIcon = ({ className, filled, half }) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor"><defs><linearGradient id="half_grad"><stop offset="50%" stopColor="currentColor" /><stop offset="50%" stopColor="#d1d5db" stopOpacity="1" /></linearGradient></defs><path fill={half ? "url(#half_grad)" : (filled ? "currentColor" : "none")} stroke="currentColor" strokeWidth="1" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
const ReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CloseButton = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        // <-- 1. แก้ไข className ให้เป็นวงกลมสีดำ และปรับขนาดไอคอน/เส้น
        className="absolute top-4 right-4 bg-black rounded-full p-1.5 text-white hover:bg-gray-700 transition-colors z-10  justify-items-center">
        <svg xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-17" // <-- 2. ปรับขนาดจาก h-6 w-6
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth="2.5" // <-- 3. เพิ่มความหนาของเส้น
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const PhotoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
// Skeleton Component (ก๊อปไปวางไว้แถวๆ Icons)
const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`}></div>
);


// --- Authentication Screens ---
// ... (WelcomeScreen, SignUpScreen - No changes) ...
function WelcomeScreen({ setView }) {
    return (
        <div className="relative w-full h-[100dvh] bg-cover bg-center text-white dark:text-gray-200" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
            <div className="absolute inset-0 flex flex-col justify-center items-center p-8 bg-black/50">
                <div className="text-center"><h1 className="text-6xl md:text-8xl font-bold tracking-wider">EW</h1><p className="text-2xl md:text-3xl font-light tracking-widest mt-2">EASYWAY</p></div>
                <div className="mt-16 text-center"><h2 className="text-3xl md:text-4xl font-semibold">Welcome To The App EasyWay</h2><p className="mt-4 text-lg md:text-xl italic text-gray-300">"Every Journey Starts With A Single Pin."</p></div>
                <div className="mt-16 flex flex-col items-center w-full max-w-xs">
                    <button onClick={() => setView('login')} className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition duration-300">Login</button>
                    <button onClick={() => setView('map')} className="w-full mt-4 bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white hover:text-black transition duration-300">Continue As Guest</button>
                    <button onClick={() => setView('signup')} className="mt-8 text-white underline hover:text-gray-300 transition">Create an Account</button>
                </div>
            </div>
        </div>
    );
}
function SignUpScreen({ setView }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError("Password should be at least 6 characters.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                createdAt: serverTimestamp(), // Use server timestamp
                status: 'active',
                displayName: email.split('@')[0] // Default display name
            });
            // Optionally update Auth profile display name
            await updateProfile(user, { displayName: email.split('@')[0] });

        } catch (err) {
            setError("Failed to create an account. The email may already be in use.");
            console.error(err);
        }
    };
    return (
        <div className="w-screen h-[100dvh] flex bg-white dark:bg-gray-900 bg-gradient-to-br from-sky-200 to-blue-300 dark:from-sky-800 dark:to-blue-900">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 ">
                <div className="w-full max-w-md">
                    <header className="flex justify-between items-center mb-10"><h1 className="text-5xl font-bold text-blue-800 dark:text-blue-300">EasyWay</h1><div><button onClick={() => setView('login')} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-800 dark:hover:text-blue-400">Login</button><button onClick={() => setView('welcome')} className="px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600">Welcome</button></div></header>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Create Account</h2><p className="mt-2 text-gray-600 dark:text-gray-400">"Welcome to the app EasyWay"</p>
                     {error && <p className="mt-4 text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-3 rounded">{error}</p>}
                    <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                        <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email (Username)</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 focus:ring-opacity-50" placeholder="Enter your email"/></div>
                        <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 focus:ring-opacity-50" placeholder="Create a password (min. 6 characters)"/></div>
                        <div><button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-500 transition duration-300">Sign Up</button></div>
                    </form>
                </div>
            </div>
            <div className="hidden lg:flex w-1/2 relative items-center justify-center">
            <CloseButton onClick={() => setView('welcome')} />
            <img src="https://www.brandbuffet.in.th/wp-content/uploads/2022/09/shutterstock_motorbike-%E0%B8%A7%E0%B8%B4%E0%B8%99-%E0%B8%A1%E0%B8%AD%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%84%E0%B8%8B%E0%B8%84%E0%B9%8C.jpg" alt="Person working on laptop" className="w-full h-full object-cover rounded-[100px] rounded-tr-[350px] pt-[25px] pb-[15px] pr-[15px]"/></div>
        </div>
    );
}

// --- Login Screen (Added Password Reset) ---
function LoginScreen({ setView }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false); // <-- State for reset modal

    const handleLogin = async (e) => {
        console.log("handleLogin: เริ่มทำงาน");
        e.preventDefault();
        setError('');
        try {
            console.log("handleLogin: กำลังเรียก signInWithEmailAndPassword...");
            // 1. ล็อกอิน Auth ก่อน
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("handleLogin: signInWithEmailAndPassword สำเร็จ!");

            // --- ⭐ จุดที่เพิ่มเข้ามา ⭐ ---
            // 2. เช็ก status ใน Firestore ทันที
            console.log("handleLogin: กำลังเช็ก status ใน Firestore...");
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists() && userSnap.data().status === 'suspended') {
                // 3. ถ้าถูกระงับ
                console.log("handleLogin: ตรวจพบ status 'suspended'");
                // 3a. แสดง Error
                setError("บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแล");
                // 3b. และ!! สั่ง Log out ทันที
                await signOut(auth); 
                return; // จบการทำงานตรงนี้
            }
            // --- ⭐ จบส่วนที่เพิ่ม ⭐ ---

            // 4. ถ้าไม่ถูกระงับ (ก็คือผ่าน)
            // onAuthStateChanged ใน App.js จะทำงานต่อตามปกติ
            console.log("handleLogin: สถานะปกติ, ให้ App.js ทำงานต่อ");

        } catch (err) {
            console.error("Login Error Code:", err.code); 
            if (err.code === 'auth/user-disabled') {
                // นี่คือการ Disabled จากหน้า Auth (คนละส่วนกับ Suspend)
                setError("บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแล");
            } else {
                // Error อื่นๆ (เช่น รหัสผิด, ไม่มี user นี้)
                setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
            }
        }
    };
    const handleGoogleSignIn = async () => {
        setError('');
        const provider = new GoogleAuthProvider(); 
        try {
            console.log("Google Sign-In: เริ่มทำงาน...");
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("Google Sign-In: Auth สำเร็จ, กำลังเช็ก Firestore...");

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // --- 1. ผู้ใช้ใหม่: สร้างเอกสาร ---
                console.log("Google Sign-In: ผู้ใช้ใหม่, กำลังสร้างเอกสาร...");
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    createdAt: serverTimestamp(),
                    status: 'active' 
                });
                console.log("Google Sign-In: สร้างเอกสารเรียบร้อย");

            // --- ⭐⭐ 2. จุดที่เพิ่มเข้ามา: เช็กผู้ใช้เดิม ⭐⭐ ---
            } else if (userSnap.data().status === 'suspended') {
                // --- 3. ถ้าผู้ใช้ถูกระงับ ---
                console.log("Google Sign-In: ตรวจพบ status 'suspended', กำลังเตะออก...");
                setError("บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแล");
                await signOut(auth); // <-- สั่ง Log out ทันที
                return; // <-- จบการทำงาน

            } else {
                // --- 4. ถ้าผู้ใช้เดิม และ status 'active' ---
                console.log("Google Sign-In: ผู้ใช้เดิม สถานะ 'active', ล็อกอินปกติ");
                // (ไม่ต้องทำอะไร ให้ App.js จัดการต่อ)
            }
            
        } catch (err) {
            console.error("Google Sign-In Error:", err);
            if (err.code !== 'auth/popup-closed-by-user') {
                 setError("Failed to sign in with Google. Please try again.");
            }
        }
    };

    return (
        <>
            <div className="w-screen h-[100dvh] flex bg-white dark:bg-gray-900 bg-gradient-to-br from-sky-200 to-blue-300 dark:from-sky-800 dark:to-blue-900">
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 ">
                    <div className="w-full max-w-md">
                        <header className="flex justify-between items-center mb-10">
                            <h1 className="text-5xl font-bold text-blue-800 dark:text-blue-300">EasyWay</h1>
                            <div>
                                <button onClick={() => setView('welcome')} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-800 dark:hover:text-blue-400">Welcome</button>
                                <button onClick={() => setView('signup')} className="px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600">Create an Account</button>
                            </div>
                        </header>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Login</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">"Welcome back to the app EasyWay"</p>
                        {error && <p className="mt-4 text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-3 rounded">{error}</p>}
                        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email (Username)</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 focus:ring-opacity-50" placeholder="Enter your email"/>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                                <input type={passwordVisible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 focus:ring-opacity-50" placeholder="Enter your password"/>
                                <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 top-6 flex items-center px-4 text-gray-500 dark:text-gray-400"><EyeIcon closed={passwordVisible} /></button>
                            </div>
                            <div className="flex justify-end">
                                <button type="button" onClick={() => setIsPasswordResetOpen(true)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Forgot Password?</button>
                            </div>
                            <div><button type="submit" className="w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold py-3 px-4 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300">Login</button></div>
                        </form>
                        <div className="mt-6 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2  text-gray-600 dark:text-gray-400 font-bold">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                className="w-full flex items-center justify-center bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300"
                            >
                                <GoogleIcon />
                                Sign in with Google
                            </button>
                        </div>
                    </div>
                </div>
                <div className="hidden lg:flex w-1/2 relative items-center justify-center"><img src="https://upload.wikimedia.org/wikipedia/commons/b/bf/Songthaew_in_Bangkok_%283%29.jpg" alt="Driving with map" className="w-full h-full object-cover rounded-[100px] rounded-tr-[350px] pt-[25px] pb-[15px] pr-[15px]"/>
                <CloseButton onClick={() => setView('welcome')} />
                </div>
            </div>
            {isPasswordResetOpen && <PasswordResetModal onClose={() => setIsPasswordResetOpen(false)} />}
        </>
    );
}

// --- Password Reset Modal (New Component) ---
const PasswordResetModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage(`Password reset email sent to ${email}. Please check your inbox (and spam folder).`);
            setEmail(''); // Clear email field on success
        } catch (err) {
            setError("Failed to send password reset email. Please check the email address.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Reset Password</h2>
                <form onSubmit={handlePasswordReset}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Enter the email address associated with your account, and we'll send you a link to reset your password.</p>
                    {message && <p className="mb-4 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 p-3 rounded">{message}</p>}
                    {error && <p className="mb-4 text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-3 rounded">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 focus:ring-opacity-50"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded transition duration-300">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-400 transition duration-300">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Admin Dashboard Components ---
// ... (ManageUsers - No changes needed) ...
// ... (UserFormModal - No changes needed) ...
// ... (ManageLocations - Updated handleDelete) ...
// ... (ManageReports - No changes needed) ...
// ... (LocationMapView - No changes needed) ...
// ... (AdminDashboard - Updated structure) ...

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // --- ⭐ 1. เพิ่ม State สำหรับเรียงลำดับ ---
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = ใหม่->เก่า, 'asc' = เก่า->ใหม่

    useEffect(() => {
        const q = query(collection(db, "users"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
        });
        return () => unsubscribe();
    }, []);

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleToggleUserStatus = async (user) => {
        const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
        const actionVerb = newStatus === 'active' ? 'activate' : 'suspend';

        if (window.confirm(`Are you sure you want to ${actionVerb} user ${user.email}?`)) {
            try {
                const userRef = doc(db, "users", user.id);
                await updateDoc(userRef, { status: newStatus });
                alert(`User status updated to '${newStatus}'.`);
            } catch (error) {
                console.error("Error updating user status:", error);
                alert(`Failed to update status.`);
            }
        }
    };

    // --- ⭐ 2. Logic การเรียงลำดับข้อมูล (Sorting) ---
    const sortedUsers = [...users].sort((a, b) => {
        const dateA = a.createdAt?.toMillis() || 0;
        const dateB = b.createdAt?.toMillis() || 0;
        if (sortOrder === 'desc') {
            return dateB - dateA; // ใหม่ไปเก่า
        } else {
            return dateA - dateB; // เก่าไปใหม่
        }
    });

    // กรองข้อมูลจากการค้นหา (ใช้ sortedUsers มากรองต่อ)
    const filteredUsers = sortedUsers.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ฟังก์ชันสลับโหมด
    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    return (
        <div className="dark:text-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold">Manage Users</h2>
                <div className="flex w-full md:w-auto space-x-2">
                    <input
                        type="text"
                        placeholder="Search by email..."
                        className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* --- ⭐ 3. ปุ่ม Sort Date --- */}
                    <button 
                        onClick={toggleSortOrder} 
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded flex items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap"
                        title={sortOrder === 'desc' ? "Newest joined first" : "Oldest joined first"}
                    >
                        {/* ถ้ายังไม่มี SortIcon ให้ใช้ Text แทน หรือไปเพิ่ม Icon ตามที่เคยบอกครับ */}
                        <span className="mr-2">{sortOrder === 'desc' ? '⬇' : '⬆'}</span>
                        Date
                    </button>

                    <button onClick={() => handleOpenModal()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap">Add User</button>
                </div>
            </div>

            {/* 📱 Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                            <div className="overflow-hidden">
                                <p className="font-bold text-gray-800 dark:text-white truncate">{user.email}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Name: {user.displayName || '-'}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                                user.status === 'active' || !user.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {user.status || 'active'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">Joined: {user.createdAt?.toDate().toLocaleString()}</p>
                        
                        <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                            {/* ปุ่ม Edit เอาออกตามที่คุณเคยคอมเมนต์ไว้ หรือจะใส่กลับก็ได้ */}
                             <button
                                onClick={() => handleToggleUserStatus(user)}
                                className={`flex-1 py-1.5 rounded-lg text-sm font-semibold text-white ${
                                    user.status === 'suspended' ? 'bg-green-600' : 'bg-red-500'
                                }`}
                            >
                                {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 💻 Desktop View (Table) */}
            <div className="hidden md:block bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Email</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Display Name</th> 
                            {/* --- ⭐ 4. เพิ่มลูกศรบอกที่ Header --- */}
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={toggleSortOrder}>
                                Created At {sortOrder === 'desc' ? '↓' : '↑'}
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">{user.email}</td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">{user.displayName}</td> 
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                                    {user.createdAt?.toDate().toLocaleString()}
                                </td>
                                
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.status === 'active' || !user.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {user.status || 'active'}
                                    </span>
                                </td>

                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center">
                                    <button
                                        onClick={() => handleToggleUserStatus(user)}
                                        className={user.status === 'suspended' ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}
                                    >
                                        {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <UserFormModal currentUser={editingUser} onClose={handleCloseModal} />}
        </div>
    );
};




const ManageLocations = ({ onViewLocation }) => {
    const [locations, setLocations] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('approved');

    useEffect(() => {
        const q = query(collection(db, "locations"), where("status", "==", statusFilter));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const locsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLocations(locsData);
        });
        return () => unsubscribe();
    }, [statusFilter]);

    const handleOpenModal = (loc = null) => {
        setCurrentLocation(loc);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentLocation(null);
    };

    // --- ⭐ Updated handleDelete for Storage and Reports ⭐ ---
    const handleDelete = async (locationToDelete) => {
            if (!locationToDelete || !locationToDelete.id) return;
            const locationId = locationToDelete.id;
            const locationName = locationToDelete.name;
            const isPending = locationToDelete.status === 'pending';

            // ปรับข้อความยืนยัน
            const confirmMessage = isPending 
                ? `Are you sure you want to REJECT "${locationName}"? This will notify the user and remove the pin.` 
                : `Are you sure you want to DELETE "${locationName}"? This cannot be undone.`;

            if (window.confirm(confirmMessage)) {
                try {
                    const locationRef = doc(db, "locations", locationId);
                    

                    // 1. ส่งแจ้งเตือนหาเจ้าของหมุด (ทำทั้งกรณี Reject และ Delete)
                    if (locationToDelete.submittedBy) {
                        const message = isPending 
                            ? `Your location submission "${locationName}" was rejected by admin.`
                            : `Your location "${locationName}" has been removed by the administrator.`;
                            
                        
                        // ใช้ type 'rejected' ทั้งคู่เพื่อให้ขึ้นสีแดง
                        await addDoc(collection(db, "users", locationToDelete.submittedBy, "notifications"), {
                            type: 'rejected', 
                            locationName: locationName,
                            message: message,
                            createdAt: serverTimestamp(),
                            read: false
                        });
                    }
                    // 2. ลบรูปภาพ (ถ้ามี)
                    if (locationToDelete.imageUrl) {
                        try {
                            const imageRef = storageRef(storage, locationToDelete.imageUrl);
                            await deleteObject(imageRef);
                        } catch (err) { 
                            if (err.code !== 'storage/object-not-found') console.error("Image delete error:", err); 
                        }
                    }

                    // 3. ลบ Sub-collections (Reports & Reviews)
                    const deleteSubCollection = async (collName) => {
                        const q = query(collection(db, collName), where("locationId", "==", locationId));
                        const snapshot = await getDocs(q);
                        const promises = snapshot.docs.map(doc => deleteDoc(doc.ref));
                        await Promise.all(promises);
                    };
                    await deleteSubCollection("reports");
                    await deleteSubCollection("reviews");

                    // 4. ลบเอกสาร Location ถาวร (ทำเป็นขั้นตอนสุดท้าย)
                    await deleteDoc(locationRef);

                    console.log(`Location deleted: ${locationName}`);
                    // alert("Deleted successfully."); // (เลือกได้ว่าจะใส่หรือไม่)

                } catch (error) {
                    console.error(`Error processing ${locationName}:`, error);
                    alert(`Failed to delete. Check console.`);
                }
            }
        };
    const handleApprove = async (location) => { 
        try {
            const locRef = doc(db, "locations", location.id);
            await updateDoc(locRef, { status: 'approved' });

            // --- ⭐ ส่งแจ้งเตือนเมื่ออนุมัติ ---
            if (location.submittedBy) {
                await addDoc(collection(db, "users", location.submittedBy, "notifications"), {
                    type: 'approved',
                    locationName: location.name,
                    message: `Your location "${location.name}" has been approved and is now visible!`,
                    createdAt: serverTimestamp(),
                    read: false
                });
            }
            // ----------------------------------------
            toast.success(`อนุมัติ "${location.name}" เรียบร้อย!`);
        // -------------------------------
        } catch (error) {
            console.error("Error approving:", error);
            alert("Failed to approve.");
        }
  };

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ... ใน const ManageLocations ...

    return (
        <div className="dark:text-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold">Manage Locations</h2>
                <div className="flex w-full md:w-auto space-x-2">
                    <input type="text" placeholder="Search..." className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <button onClick={() => handleOpenModal()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap">Add Location</button>
                </div>
            </div>

            <div className="mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setStatusFilter('approved')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'approved' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Approved Locations</button>
                    <button onClick={() => setStatusFilter('pending')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'pending' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Pending Requests</button>
                </nav>
            </div>

            {/* 📱 Mobile View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredLocations.map(loc => (
                    <div key={loc.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                <img src={loc.imageUrl || "https://placehold.co/100"} alt={loc.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-800 dark:text-white truncate">{loc.name}</h3>
                                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 capitalize">{loc.type}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <button onClick={() => onViewLocation(loc)} className="bg-blue-50 text-blue-600 py-1.5 rounded-lg text-sm font-medium">View</button>
                            <button onClick={() => handleOpenModal(loc)} className="bg-gray-100 text-gray-600 py-1.5 rounded-lg text-sm font-medium">Edit</button>
                            {statusFilter === 'pending' && (
                                <button onClick={() => handleApprove(loc)} className="col-span-2 bg-green-600 text-white py-1.5 rounded-lg text-sm font-bold">Approve</button>
                            )}
                            <button onClick={() => handleDelete(loc)} className="col-span-2 bg-red-50 text-red-600 py-1.5 rounded-lg text-sm font-medium border border-red-100">
                                {statusFilter === 'pending' ? 'Reject' : 'Delete'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 💻 Desktop View (ตารางเดิม) */}
            <div className="hidden md:block bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Pin Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLocations.map(loc => (
                            <tr key={loc.id}>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">{loc.name}</td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm capitalize">{loc.type}</td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center">
                                    <div className="flex justify-center items-center space-x-2">
                                        <button onClick={() => onViewLocation(loc)} className="text-blue-600 hover:text-blue-900">View</button>
                                        {statusFilter === 'pending' && <button onClick={() => handleApprove(loc)} className="text-green-600 hover:text-green-900">Approve</button>}
                                        <button onClick={() => handleOpenModal(loc)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDelete(loc)} className="text-red-600 hover:text-red-900">{statusFilter === 'pending' ? 'Reject' : 'Delete'}</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <LocationFormModal currentLocation={currentLocation} onClose={handleCloseModal} onSuccess={handleCloseModal}/>}
        </div>
    );
};

const ManageReports = () => {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "reports"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReports(reportsData);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (reportId, newStatus) => {
        const reportRef = doc(db, "reports", reportId);
        await updateDoc(reportRef, { status: newStatus });
    };

    const handleDelete = async (reportId) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            await deleteDoc(doc(db, "reports", reportId));
        }
    };

    return (
        <div className="dark:text-gray-200">
            <h2 className="text-3xl font-bold mb-5">Manage Reports</h2>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Location Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Details</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">By</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id}>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">{report.locationName}</td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm max-w-xs break-words">{report.reportText}</td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">{report.userEmail}</td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">{report.createdAt?.toDate().toLocaleString()}</td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center">
                                    <select
                                        value={report.status} onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                        className={`p-1 rounded text-xs dark:bg-gray-700 ${report.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}
                                    >
                                        <option value="pending">Pending</option> <option value="resolved">Resolved</option>
                                    </select>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center">
                                    <button onClick={() => handleDelete(report.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const LocationMapView = ({ location, onBack }) => {
    const mapRef = useRef(null);
    const isLoaded = window.google && window.google.maps;
    const [existingLocations, setExistingLocations] = useState([]);

    // 1. ดึงข้อมูลหมุดที่ Approved แล้วมาเพื่อเป็น Context
    useEffect(() => {
        const fetchExistingLocations = async () => {
            try {
                // ดึงเฉพาะหมุดที่อนุมัติแล้ว (approved)
                const q = query(collection(db, "locations"), where("status", "==", "approved"));
                const querySnapshot = await getDocs(q);
                const locs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setExistingLocations(locs);
            } catch (error) {
                console.error("Error fetching context locations:", error);
            }
        };

        fetchExistingLocations();
    }, []);

    // 2. วาดแผนที่และหมุด
    useEffect(() => {
        if (isLoaded && mapRef.current) {
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: location.lat, lng: location.lng },
                zoom: 16, // ซูมเข้าไปใกล้หน่อยเพื่อให้เห็นชัด
                disableDefaultUI: true,
            });

            // --- A. วาดหมุด Context (หมุดอื่นๆ ที่อนุมัติแล้ว) ---
            // ให้เป็นสีฟ้า (Blue) หรือสีเทา เพื่อไม่ให้เด่นแย่งซีน
            existingLocations.forEach(loc => {
                // อย่าเพิ่งวาด ถ้ามันคือหมุดตัวเดียวกับที่เรากำลังดูอยู่ (ป้องกันซ้อนทับ)
                if (loc.id === location.id) return;

                new window.google.maps.Marker({
                    position: { lat: loc.lat, lng: loc.lng },
                    map: map,
                    title: `(Approved) ${loc.name}`,
                    // ใช้ไอคอนสีฟ้า
                    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", 
                    opacity: 0.7 // ทำให้จางลงหน่อยจะได้รู้ว่าเป็นแค่พื้นหลัง
                });
            });

            // --- B. วาดหมุด Target (หมุดที่เรากำลังตรวจสอบ) ---
            // ให้เป็นสีแดง (Red) และเด้งดึ๋งๆ (Bounce) จะได้เด่นที่สุด
            new window.google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: map,
                title: `Checking: ${location.name}`,
                animation: window.google.maps.Animation.BOUNCE, // ใส่ Animation ให้เด้ง
                icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // สีแดงชัดเจน
                zIndex: 999 // ให้มันอยู่บนสุดเสมอ
            });
        }
    }, [isLoaded, location, existingLocations]);

    return (
        <div className="dark:text-gray-200">
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h2 className="text-3xl font-bold">Viewing: {location.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>Target Pin (Checking)
                        <span className="ml-4 inline-block w-3 h-3 bg-blue-400 rounded-full mr-2"></span>Existing Pins (Context)
                    </p>
                </div>
                <button onClick={onBack} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Back</button>
            </div>
            <div ref={mapRef} className="w-full h-[600px] rounded-lg shadow-md bg-gray-300 dark:bg-gray-700">
                {!isLoaded && <div className="flex items-center justify-center h-full">Loading map...</div>}
            </div>
        </div>
    );
};


function AdminDashboard() {
    // --- ⭐ Updated: Removed Dashboard Link, Default to Users ⭐ ---
    const [view, setView] = useState('users'); // Default view
    const [viewingLocation, setViewingLocation] = useState(null);

    const handleSignOut = async () => {
        try { await signOut(auth); } catch (error) { console.error("Sign out error: ", error); }
    };

    const renderView = () => {
        if (viewingLocation) {
            return <LocationMapView location={viewingLocation} onBack={() => setViewingLocation(null)} />;
        }
        switch (view) {
            case 'users': return <ManageUsers />;
            case 'locations': return <ManageLocations onViewLocation={setViewingLocation} />;
            case 'reports': return <ManageReports />;
            default: return <ManageUsers />; // Fallback
        }
    };

    // ... ใน function AdminDashboard ...

    return (
        // เปลี่ยน layout: มือถือเป็นแนวตั้ง (col), จอคอมเป็นแนวนอน (row)
        <div className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-900">
            <Toaster position="bottom-right" reverseOrder={false} />
            
            {/* Sidebar / Topbar */}
            <div className="w-full md:w-64 bg-gray-800 dark:bg-gray-950 text-white p-5 flex flex-col flex-shrink-0">
                <div className="flex justify-between items-center md:block">
                    <h1 className="text-2xl font-bold mb-0 md:mb-10">Admin Panel</h1>
                </div>
                
                {/* เมนู: มือถือเรียงแนวนอน, คอมเรียงแนวตั้ง */}
                <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 mt-4 md:mt-0 overflow-x-auto pb-2 md:pb-0">
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('users'); setViewingLocation(null);}} className={`p-2 rounded whitespace-nowrap ${view === 'users' && !viewingLocation ? 'bg-gray-700 dark:bg-gray-800' : 'hover:bg-gray-700 dark:hover:bg-gray-800'}`}>Users</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('locations'); setViewingLocation(null);}} className={`p-2 rounded whitespace-nowrap ${view === 'locations' && !viewingLocation ? 'bg-gray-700 dark:bg-gray-800' : 'hover:bg-gray-700 dark:hover:bg-gray-800'}`}>Locations</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('reports'); setViewingLocation(null);}} className={`p-2 rounded whitespace-nowrap ${view === 'reports' && !viewingLocation ? 'bg-gray-700 dark:bg-gray-800' : 'hover:bg-gray-700 dark:hover:bg-gray-800'}`}>Reports</a>
                </nav>

                <button onClick={handleSignOut} className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded hidden md:block">
                    Sign Out
                </button>
                {/* ปุ่ม Logout มือถือ (แยกออกมาเพื่อให้จัดวางง่าย) */}
                <button onClick={handleSignOut} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded md:hidden">
                    Sign Out
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 md:p-10 overflow-y-auto">
                {renderView()}
            </div>
        </div>
    );
}

// ... (LocationFormModal - No changes needed) ...
// ... (LocationFormModal ตัวใหม่) ...
// ... (วางทับ LocationFormModal ตัวเดิม) ...
// ... (วางทับ LocationFormModal ตัวเดิมทั้งหมด) ...

// --- Location Form Modal (Updated with Skeleton on Upload) ---
const LocationFormModal = ({ currentLocation, onClose, initialCoords, onSuccess }) => {
    const [name, setName] = useState(currentLocation?.name || '');
    const [lat, setLat] = useState(currentLocation?.lat || initialCoords?.lat || '');
    const [lng, setLng] = useState(currentLocation?.lng || initialCoords?.lng || '');
    const [type, setType] = useState(currentLocation?.type || 'motorcycle');
    const [routes, setRoutes] = useState(currentLocation?.routes || [{ destination: '', price: '' }]);
    
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(currentLocation?.imageUrl || null);

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleRouteChange = (index, field, value) => {
        const newRoutes = [...routes];
        newRoutes[index][field] = field === 'price' ? Number(value) : value;
        setRoutes(newRoutes);
    };

    const addRoute = () => setRoutes([...routes, { destination: '', price: '' }]);
    const removeRoute = (index) => setRoutes(routes.filter((_, i) => i !== index));

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || name.trim() === '') {
            setError("Please enter a Pin Name.");
            return;
        }
        if (!imageFile && !currentLocation?.imageUrl) {
            setError("Please upload an image for the location."); return;
        }
        if (!auth.currentUser) {
            setError("You must be logged in to submit a location."); return;
        }

        setUploading(true);
        let imageUrl = currentLocation?.imageUrl || '';

        try {
            if (imageFile) {
                if (currentLocation?.imageUrl) { 
                    try {
                        const oldImageRef = storageRef(storage, currentLocation.imageUrl);
                        await deleteObject(oldImageRef);
                    } catch (deleteError) { console.warn("Could not delete old image:", deleteError); }
                }
                const imageRef = storageRef(storage, `locations/${Date.now()}-${imageFile.name}`);
                const snapshot = await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            const locationData = {
                name, lat: Number(lat), lng: Number(lng), type, routes, imageUrl,
                status: currentLocation?.status || 'pending',
                submittedBy: auth.currentUser.uid,
                createdAt: currentLocation?.createdAt || serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            if (currentLocation) {
                await setDoc(doc(db, "locations", currentLocation.id), locationData, { merge: true });
            } else {
                await addDoc(collection(db, "locations"), locationData);
            }
            onSuccess(); 
        } catch (err) {
            console.error("Error submitting location:", err); 
            setError("Failed to submit. Please try again.");
        } finally { 
            setUploading(false); 
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {currentLocation ? '✏️ Edit Location' : '📍 Add New Location'}
                    </h3>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-100 dark:border-red-800 flex items-center">
                            {error}
                        </div>
                    )}

                    {/* Image Upload with Skeleton Overlay */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location Image</label>
                        <div className="relative group h-48 w-full">
                            
                            {/* Input File (ซ่อนไว้) */}
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" disabled={uploading}/>
                            
                            {/* ส่วนแสดงผล (Preview หรือ Placeholder) */}
                            <div className={`absolute inset-0 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${imagePreview ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-2xl" />
                                ) : (
                                    <>
                                        <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 p-3 rounded-full mb-3"><PhotoIcon /></div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Click to upload image</p>
                                    </>
                                )}
                            </div>

                            {/* --- ☠️ Skeleton Overlay (แสดงตอนกำลังอัปโหลด) --- */}
                            {uploading && (
                                <div className="absolute inset-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                                    <div className="w-full h-full p-4">
                                        <Skeleton className="w-full h-full rounded-xl" />
                                        <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300 font-bold animate-pulse">
                                            Uploading...
                                        </p>
                                    </div>
                                </div>
                            )}
                            {/* ------------------------------------------------ */}
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pin Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white" required />
                        </div>
                        <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Latitude</label><input type="number" value={lat} readOnly className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" /></div>
                        <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Longitude</label><input type="number" value={lng} readOnly className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" /></div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Vehicle Type</label>
                            <div className="relative">
                                <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white appearance-none">
                                    <option value="motorcycle">🛵 Win Motorbike</option>
                                    <option value="songthaew">🚌 Songthaew</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Places & Prices */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Destinations & Prices</h4>
                            <button type="button" onClick={addRoute} className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center"><span className="mr-1"><PlusIcon /></span> Add Route</button>
                        </div>
                        <div className="space-y-4"> {/* เพิ่มระยะห่างระหว่างการ์ด */}
                            {routes.map((route, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-3 sm:items-end animate-fadeIn bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                                    
                                    {/* 1. ช่อง Destination (บนมือถือเต็มความกว้าง / บนคอมยืดหยุ่น) */}
                                    <div className="flex-1 w-full">
                                        {/* Label โชว์เฉพาะมือถือ เพื่อให้อ่านง่าย */}
                                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block sm:hidden ml-1">Destination</label>
                                        <input 
                                            type="text" 
                                            placeholder="Destination (e.g. BTS Station)" 
                                            value={route.destination} 
                                            onChange={e => handleRouteChange(index, 'destination', e.target.value)} 
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition" 
                                        />
                                    </div>

                                    {/* 2. ช่อง Price & ปุ่ม Delete (บนมือถืออยู่บรรทัดล่างคู่กัน) */}
                                    <div className="flex items-end gap-3 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:w-40"> {/* ยืดเต็มในมือถือ, กว้าง 40 ในคอม */}
                                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block sm:hidden ml-1">Price</label>
                                            <input 
                                                type="number" 
                                                placeholder="Price" 
                                                value={route.price} 
                                                onChange={e => handleRouteChange(index, 'price', e.target.value)} 
                                                className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition" 
                                            />
                                            <span className="absolute right-3 bottom-2.5 text-gray-400 text-xs font-bold">฿</span>
                                        </div>
                                        
                                        {/* ปุ่มลบ */}
                                        {routes.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeRoute(index)} 
                                                className="p-2.5 mb-[1px] text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition flex-shrink-0"
                                                title="Remove route"
                                            >
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition">Cancel</button>
                    <button 
                        type="button"
                        onClick={handleSubmit}
                        disabled={uploading} 
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 disabled:bg-blue-400 disabled:cursor-not-allowed transition transform active:scale-95 flex items-center"
                    >
                        {uploading ? 'Saving...' : 'Save Location'}
                    </button>
                </div>
            </div>
        </div>
    );
};

//--- ⭐⭐ Feature Components ⭐⭐ ---
// ... (StarRatingDisplay, StarRatingInput - No changes needed) ...
// ... (ReviewsModal, ReportModal - No changes needed) ...
// ... (ImageModal - New Component) ...
// ... (ProfileModal - New Component) ...
const StarRatingDisplay = ({ rating = 0, count = 0 }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) stars.push(<StarIcon key={i} className="text-yellow-400" filled />);
        else if (i === Math.ceil(rating) && !Number.isInteger(rating)) stars.push(<StarIcon key={i} className="text-yellow-400" half />);
        else stars.push(<StarIcon key={i} className="text-gray-300 dark:text-gray-600" filled />);
    }
    return <div className="flex items-center">{stars} <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({count || 0} reviews)</span></div>;
};

const StarRatingInput = ({ rating, setRating }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex space-x-1">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return ( <label key={index}><input type="radio" name="rating" value={ratingValue} onClick={() => setRating(ratingValue)} className="hidden" /><StarIcon className={`cursor-pointer transition-colors duration-200 ${ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} onMouseEnter={() => setHover(ratingValue)} onMouseLeave={() => setHover(0)} filled /></label> );
            })}
        </div>
    );
};

// --- Reviews Modal (Updated with Skeleton) ---
const ReviewsModal = ({ location, user, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReviewText, setNewReviewText] = useState('');
    const [newRating, setNewRating] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!location) return;
        setLoading(true);
        const q = query(collection(db, "reviews"), where("locationId", "==", location.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false); // โหลดเสร็จแล้ว ปิด Skeleton
        });
        return () => unsubscribe();
    }, [location]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) { setError("Please log in."); return; }
        if (newRating === 0) { setError("Please select rating."); return; }
        if (newReviewText.trim() === '') { setError("Please write review."); return; }
        setError('');

        const reviewData = {
            locationId: location.id,
            userId: user.uid,
            userEmail: user.email,
            userName: user.displayName || user.email.split('@')[0],
            rating: newRating,
            text: newReviewText,
            createdAt: serverTimestamp()
        };

        try {
            await addDoc(collection(db, "reviews"), reviewData);
            
            // เคลียร์ค่าทันที
            setNewReviewText('');
            setNewRating(0);

            // อัปเดตค่าเฉลี่ยใน Location (แยก try-catch)
            try {
                const locationRef = doc(db, "locations", location.id);
                const currentReviewCount = location.reviewCount || 0;
                const currentAvgRating = location.avgRating || 0;
                const newCount = currentReviewCount + 1;
                const newAvg = (currentAvgRating * currentReviewCount + newRating) / newCount;

                await updateDoc(locationRef, {
                    reviewCount: newCount,
                    avgRating: isNaN(newAvg) ? currentAvgRating : newAvg
                });
            } catch (updateError) {
                console.error("Error updating stats:", updateError);
            }
        } catch (addError) {
            console.error("Error adding review:", addError);
            setError("Failed to submit review.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold dark:text-white">Reviews for {location.name}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-3xl font-bold">&times;</button>
                </div>
                
                <div className="p-4 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        // --- ☠️ ส่วน Skeleton Loading ---
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="border-b dark:border-gray-700 pb-4">
                                    <div className="flex items-center mb-3">
                                        <Skeleton className="h-5 w-24 mr-2" /> {/* ดาวปลอม */}
                                        <Skeleton className="h-4 w-20 ml-auto" /> {/* วันที่ปลอม */}
                                    </div>
                                    <Skeleton className="h-4 w-32 mb-2" /> {/* ชื่อคนปลอม */}
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" /> {/* ข้อความบรรทัด 1 */}
                                        <Skeleton className="h-4 w-3/4" />  {/* ข้อความบรรทัด 2 */}
                                    </div>
                                </div>
                            ))}
                        </div>
                        // -----------------------------
                    ) : (
                        // --- ส่วนเนื้อหาจริง ---
                        <>
                            {reviews.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-4">No reviews yet. Be the first!</p>}
                            <div className="space-y-4">
                                {reviews.map(review => (
                                    <div key={review.id} className="border-b dark:border-gray-700 pb-3 last:border-b-0">
                                        <div className="flex items-center mb-1">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <StarIcon key={i} className={`h-5 w-5 ${i + 1 <= review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} filled />
                                                ))}
                                            </div>
                                            <p className="ml-auto text-sm text-gray-500 dark:text-gray-400">{review.createdAt?.toDate().toLocaleDateString()}</p>
                                        </div>
                                        <p className="font-semibold text-sm dark:text-gray-200">{review.userName || review.userEmail.split('@')[0]}</p>
                                        <p className="text-gray-700 dark:text-gray-300 mt-1">{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-bold text-lg mb-2 dark:text-white">Write a Review</h3>
                    {user ? (
                        <form onSubmit={handleSubmitReview}>
                            {error && <p className="text-red-500 dark:text-red-400 text-sm mb-2">{error}</p>}
                            <div className="mb-2"><StarRatingInput rating={newRating} setRating={setNewRating} /></div>
                            <textarea value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" rows="3" placeholder="Share your experience..."></textarea>
                            <button type="submit" className="mt-2 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">Submit</button>
                        </form>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">Log in to write review.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const ReportModal = ({ location, user, onClose }) => {
    const [reportText, setReportText] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false); const [error, setError] = useState('');
    const handleReportSubmit = async (e) => { e.preventDefault(); if (!user) { setError('Log in to report.'); return; } if (reportText.trim() === '') { setError('Please describe issue.'); return; } setError(''); setIsSubmitting(true); try { await addDoc(collection(db, 'reports'), { locationId: location.id, locationName: location.name, reportText: reportText, userId: user.uid, userEmail: user.email, createdAt: serverTimestamp(), status: 'pending' }); toast.success("ส่งรายงานเรียบร้อยแล้ว ขอบคุณครับ!"); onClose(); } catch (err) { console.error('Report error:', err); setError('Failed to submit.'); } finally { setIsSubmitting(false); } };
    return ( <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}> <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}> <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center"><h2 className="text-2xl font-bold dark:text-white">Report Issue</h2><button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-3xl font-bold">&times;</button></div> <form onSubmit={handleReportSubmit} className="p-4"><p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Reporting: <span className="font-semibold dark:text-gray-200">{location.name}</span></p><textarea value={reportText} onChange={(e) => setReportText(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="4" placeholder="Describe problem..." required></textarea>{error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}<div className="flex justify-end mt-4"><button type="button" onClick={onClose} className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded transition duration-300 mr-2">Cancel</button><button type="submit" disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:bg-red-300 dark:disabled:bg-red-800 transition duration-300">{isSubmitting ? 'Submitting...' : 'Submit Report'}</button></div></form> </div> </div> );
};
// --- Notification Modal (Component ใหม่) ---
const NotificationModal = ({ notifications, onClose }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white text-center">🔔 Updates</h3>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {notifications.map((noti) => (
            <div key={noti.id} className={`p-3 rounded-lg border-l-4 shadow-sm ${
              noti.type === 'approved' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
            }`}>
              <h4 className={`font-bold ${noti.type === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                {noti.type === 'approved' ? '✅ Approved' : '❌ Rejected'}
              </h4>
              <p className="text-gray-700 text-sm mt-1"><strong>{noti.locationName}</strong></p>
              <p className="text-gray-600 text-xs">{noti.message}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          Got it
        </button>
      </div>
    </div>
  );
};

// --- ⭐ Image Modal (New Component) ⭐ ---
const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <img src={imageUrl} alt="Full screen location" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
            <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
        </div>
    );
};

// --- ⭐ Profile Modal (New Component) ⭐ ---
const ProfileModal = ({ user, onClose }) => {
    const [displayName, setDisplayName] = useState(user?.displayName || user?.email?.split('@')[0] || ''); const [loading, setLoading] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
    const handleProfileUpdate = async (e) => { e.preventDefault(); setMessage(''); setError(''); if (!user) return; if (displayName.trim() === '') { setError('Display name cannot be empty.'); return; } setLoading(true); try { await updateProfile(auth.currentUser, { displayName: displayName.trim() }); const userRef = doc(db, "users", user.uid); await updateDoc(userRef, { displayName: displayName.trim() }); setMessage('Profile updated!'); setTimeout(onClose, 1500); } catch (err) { setError('Failed to update.'); console.error("Profile update error:", err); } finally { setLoading(false); } };
    return ( <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}> <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}> <h2 className="text-2xl font-bold mb-4 dark:text-white">Edit Profile</h2> <form onSubmit={handleProfileUpdate}>{message && <p className="mb-4 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 p-3 rounded">{message}</p>}{error && <p className="mb-4 text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-3 rounded">{error}</p>}<div className="mb-4"><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label><p className="mt-1 text-gray-500 dark:text-gray-400">{user?.email}</p></div><div className="mb-4"><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Display Name</label><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 focus:ring-opacity-50" required /></div><div className="flex justify-end space-x-2"><button type="button" onClick={onClose} className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded transition duration-300">Cancel</button><button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-400 transition duration-300">{loading ? 'Saving...' : 'Save Changes'}</button></div></form> </div> </div> );
};


// --- Main App Screen (Map View) ---
// ⭐⭐ REVERTED Map Loading/Cleanup Logic ⭐⭐
function MapScreen({ user, setView, darkMode, toggleDarkMode }) {
    
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false); // Indicates if Google Maps script is loaded
    const [loadError, setLoadError] = useState(null);
    // Removed mapLoading state, rely only on isLoaded
    const [locations, setLocations] = useState([]);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const markersRef = useRef([]);
    const isScriptInjected = useRef(false); // Basic check to prevent duplicate script injection

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [pinningMode, setPinningMode] = useState(false);
    const [tempPin, setTempPin] = useState(null);
    const tempMarkerRef = useRef(null);
    const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [localSelectedLocation, setLocalSelectedLocation] = useState(null);
    const [showPrices, setShowPrices] = useState(false);
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false); // For full screen image
    const [fullImageUrl, setFullImageUrl] = useState(''); // For full screen image URL
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // For profile modal
    const [userLikes, setUserLikes] = useState(new Set());
    const [notifications, setNotifications] = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const [showTooCloseAlert, setShowTooCloseAlert] = useState(false);

    useEffect(() => { setLocalSelectedLocation(selectedLocation); }, [selectedLocation]);
    const handleSignOut = async () => { try { await signOut(auth); } catch (error) { console.error("Sign out error: ", error); } };
    useEffect(() => { if (!user) { setUserLikes(new Set()); return; } const likesRef = collection(db, "users", user.uid, "likes"); const unsubscribe = onSnapshot(likesRef, (snapshot) => { setUserLikes(new Set(snapshot.docs.map(doc => doc.id))); }); return () => unsubscribe(); }, [user]);
    const handleLike = async (location) => { if (!user) { alert("Log in to like."); return; } if (!location || !location.id) return; const locationId = location.id; const locationRef = doc(db, "locations", locationId); const likeRef = doc(db, "users", user.uid, "likes", locationId); const isLiked = userLikes.has(locationId); const newLikes = new Set(userLikes); const currentCount = localSelectedLocation?.likeCount || locations.find(l => l.id === locationId)?.likeCount || 0; let updatedCount; if (isLiked) { newLikes.delete(locationId); updatedCount = currentCount - 1; } else { newLikes.add(locationId); updatedCount = currentCount + 1; } setLocalSelectedLocation(prev => prev ? { ...prev, likeCount: updatedCount < 0 ? 0 : updatedCount } : null); setUserLikes(newLikes); try { if (isLiked) { await deleteDoc(likeRef); await updateDoc(locationRef, { likeCount: increment(-1) }); } else { await setDoc(likeRef, { createdAt: serverTimestamp() }); await updateDoc(locationRef, { likeCount: increment(1) }); } } catch (error) { console.error("Like error:", error); setUserLikes(userLikes); setLocalSelectedLocation(location); alert("Failed to update like."); } };

    // ฟังก์ชันสร้างรูปหมุด SVG ตามสีที่กำหนด
    const getMarkerIcon = (color) => {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="${color}">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
        </svg>`;
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    };

    // ⭐ ฟังการแจ้งเตือน Real-time
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "users", user.uid, "notifications"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
        const notiData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (notiData.length > 0) {
            setNotifications(notiData);
            setIsNotificationOpen(true); // เปิด Modal ทันทีที่มีแจ้งเตือน
        }
        });
        return () => unsubscribe();
    }, [user]);

    // ⭐ ฟังก์ชันปิดและลบแจ้งเตือน (User รับทราบแล้ว)
    const handleCloseNotification = async () => {
        setIsNotificationOpen(false);
        notifications.forEach(async (noti) => {
            try { await deleteDoc(doc(db, "users", user.uid, "notifications", noti.id)); } 
            catch (err) { console.error(err); }
        });
        setNotifications([]);
    };

    // --- ⭐ Simplified Map Loading Logic ⭐ ---
    useEffect(() => {
        const loadMapScript = () => {
             // Basic check if script is already loaded or being loaded
            if (window.google?.maps || isScriptInjected.current) {
                if (window.google?.maps) setIsLoaded(true); // If loaded, set state
                return;
            }

            console.log("Injecting Google Maps script...");
            isScriptInjected.current = true; // Mark as injected
            const script = document.createElement('script');
            script.id = 'google-maps-script';
            // Use your API Key here
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDCOw5hM4WqkOfqKElOqrZag0QAiJO68HY&libraries=places,,geometry&callback=initMap`;
            script.async = true;
            script.defer = true; // Added defer

            // Define the global callback function
            window.initMap = () => {
                console.log("window.initMap called.");
                setIsLoaded(true); // Set loaded state when callback fires
            };

            script.onerror = (e) => {
                console.error("Google Maps script failed to load:", e);
                setLoadError(new Error('Could not load Google Maps script.'));
                delete window.initMap; // Clean up callback on error
                isScriptInjected.current = false; // Allow retry potentially
            };
            document.head.appendChild(script);
        };

        loadMapScript();

        // Basic cleanup for the callback function
        return () => {
             // If the component unmounts before the script loads, remove the callback
             // This might still cause issues if multiple components load the script
            // delete window.initMap;
        };
    }, []); // Run only once

    // --- ⭐ Simplified Map Initialization & Basic Cleanup ⭐ ---
    // --- 1. Map Initialization (แก้ตรงนี้) ---
    useEffect(() => {
        // ถ้าโหลดแล้ว และยังไม่มี map instance ให้สร้างใหม่
        if (isLoaded && mapRef.current && !mapInstanceRef.current) {
            console.log("Initializing map instance...");
            try {
                const map = new window.google.maps.Map(mapRef.current, {
                    center: { lat: 13.7563, lng: 100.5018 }, // เริ่มต้นที่กรุงเทพ
                    zoom: 12,
                    disableDefaultUI: true,
                    gestureHandling: 'greedy', // (ที่เราเพิ่งเพิ่มไป)
                    // เอาค่าเริ่มต้นปกติใส่ไว้เลย
                    clickableIcons: true,
                    draggableCursor: 'grab'
                });
                mapInstanceRef.current = map;
            } catch (error) {
                console.error("Error creating map instance:", error);
                setLoadError(new Error("Failed to create map instance."));
            }
        }
        // ❌ ลบ cleanup function ออก เพื่อไม่ให้ map หายตอน re-render
        // return () => { mapInstanceRef.current = null; }; 
    }, [isLoaded]); // <--- ❌ เอา pinningMode ออก ให้เหลือแค่ isLoaded

    // --- 2. Handle Pinning Mode Changes (เพิ่มอันนี้เข้าไปใหม่) ---
    useEffect(() => {
        if (mapInstanceRef.current) {
            console.log("Updating map options for pinning mode:", pinningMode);
            mapInstanceRef.current.setOptions({
                // ถ้ากำลังปักหมุด: เมาส์เป็นกากบาท, กดไอคอนสถานที่ไม่ได้
                // ถ้าปกติ: เมาส์เป็นมือจับ, กดไอคอนสถานที่ได้
                draggableCursor: pinningMode ? 'crosshair' : 'grab',
                clickableIcons: !pinningMode, 
            });
        }
    }, [pinningMode]); // ทำงานเฉพาะตอน pinningMode เปลี่ยน

     // --- ⭐ Fetching Locations (Relies on isLoaded) ⭐ ---
    useEffect(() => {
        if (!isLoaded) return; // Wait for script
        const q = query(collection(db, "locations"), where("status", "==", "approved"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setLocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => { console.error("Error fetching locations: ", error); setLoadError(new Error("Could not fetch locations.")) });
        return () => unsubscribe();
    }, [isLoaded]);

    // --- ⭐ Drawing Markers (Relies on isLoaded, no mapLoading check) ⭐ ---
    useEffect(() => {
        if (!isLoaded || !mapInstanceRef.current) return; // Wait for script and instance

        console.log("Updating markers...");
        markersRef.current.forEach(marker => marker.setMap(null)); // Clear previous
        markersRef.current = []; // Reset array

        const filtered = locations.filter(loc => filterType === 'all' || loc.type === filterType);
        filtered.forEach(location => {
            const markerColor = location.type === 'motorcycle' ? '#DC0000' : '#001BB7';
            const marker = new window.google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: mapInstanceRef.current,
                title: location.name,
                // ⭐ ใช้ฟังก์ชันสร้างไอคอนที่นี่
                icon: {
                    url: getMarkerIcon(markerColor),
                    scaledSize: new window.google.maps.Size(40, 40), // ปรับขนาดหมุด
                    anchor: new window.google.maps.Point(20, 40) // จุดชี้อยู่ตรงกลางล่าง
                }
            });
            marker.addListener('click', () => { setSelectedLocation(location); setShowPrices(false); });
            markersRef.current.push(marker); // Add new marker to ref
        });
        console.log(`Added ${filtered.length} markers.`);

        // Basic cleanup for markers (might be insufficient)
        return () => {
            markersRef.current.forEach(marker => marker?.setMap(null));
        };
    }, [isLoaded, locations, filterType, pinningMode]); // Redraw if these change


    // --- Other useEffects (Pinning, TempPin) - Kept simple ---
    useEffect(() => { // Pinning click listener
        let listener = null;
        if (pinningMode && mapInstanceRef.current) {
            listener = mapInstanceRef.current.addListener('click', (e) => {
                if (e.placeId) return; // Ignore clicks on POIs
                setTempPin({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            });
        }
        return () => { if (listener && window.google?.maps) google.maps.event.removeListener(listener); };
    }, [pinningMode, isLoaded]);

    useEffect(() => { // TempPin marker display
        if (tempPin && mapInstanceRef.current) {
            if (!tempMarkerRef.current) { // Create if doesn't exist
                tempMarkerRef.current = new window.google.maps.Marker({
                    position: tempPin, map: mapInstanceRef.current, icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#FF0000", fillOpacity: 1, strokeColor: "white", strokeWeight: 2 },
                });
            } else { // Update position if exists
                tempMarkerRef.current.setPosition(tempPin);
                tempMarkerRef.current.setMap(mapInstanceRef.current); // Ensure it's on the map
            }
        } else if (tempMarkerRef.current) { // If tempPin is null, remove marker
            tempMarkerRef.current.setMap(null);
        }
        // Cleanup for temp marker when component unmounts (part of basic cleanup)
        return () => {
            tempMarkerRef.current?.setMap(null);
        };
    }, [tempPin]); // Only depends on tempPin presence/value

    useEffect(() => {
        let unsubscribe = null;
        
        // ตรวจสอบว่ามี Location ถูกเลือก และ Google Maps Script โหลดแล้ว
        if (!selectedLocation?.id || !isLoaded) {
            setLocalSelectedLocation(null);
            return;
        }
        
        // สร้าง Reference ไปยังเอกสาร Location ที่ถูกเลือก
        const locationRef = doc(db, "locations", selectedLocation.id);
        
        // เริ่มฟังการเปลี่ยนแปลงแบบ Real-time
        unsubscribe = onSnapshot(locationRef, (docSnap) => {
            if (docSnap.exists()) {
                // อัปเดต State ของ Location ที่แสดงใน Modal (รวมถึง reviewCount/avgRating ที่อัปเดตแล้ว)
                const updatedData = { id: docSnap.id, ...docSnap.data() };
                setLocalSelectedLocation(updatedData);
                
                // อัปเดต State หลัก selectedLocation ด้วย เพื่อใช้ในการจัดการ marker/modal
                setSelectedLocation(updatedData); 
                
            } else {
                // เอกสารถูกลบ (กรณีที่ Admin ลบ)
                setSelectedLocation(null);
            }
        }, (error) => {
            console.error("Error reading selected location:", error);
        });
    
        // Cleanup: ยกเลิก Listener เมื่อ Component unmounts หรือ ID เปลี่ยน
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
        
    }, [isLoaded, selectedLocation?.id]);
    
    


    // --- Other Functions (moveToCurrentLocation, handleSearchResultClick, etc. - Updated Zoom) ---
    const moveToCurrentLocation = () => { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition((pos) => { const { latitude, longitude } = pos.coords; const current = { lat: latitude, lng: longitude }; if (!mapInstanceRef.current) return; mapInstanceRef.current.setCenter(current); mapInstanceRef.current.setZoom(16); if (userMarkerRef.current) userMarkerRef.current.setMap(null); userMarkerRef.current = new window.google.maps.Marker({ position: current, map: mapInstanceRef.current, title: "Your Location", icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#4285F4", fillOpacity: 1, strokeColor: "white", strokeWeight: 2 }, }); }, (error) => alert("ไม่สามารถระบุตำแหน่งได้ โปรดตรวจสอบการตั้งค่าเพื่อเปิดใช้งานระบุตำแหน่ง."), { enableHighAccuracy: true }); } else { alert("Geolocation not supported."); } };
    const handleSearchResultClick = (location) => { if (mapInstanceRef.current) { mapInstanceRef.current.setCenter({ lat: location.lat, lng: location.lng }); mapInstanceRef.current.setZoom(17); } setSelectedLocation(location); setSearchQuery(''); };
    const searchResults = searchQuery ? locations.filter(loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];

    // --- ⭐ เพิ่มฟังก์ชันนี้เข้าไปครับ (วางไว้ก่อน handleConfirmPin) ⭐ ---
    const isTooCloseToExistingMarker = (newLat, newLng) => {
        // เช็กว่าโหลด Library geometry มาหรือยัง
        if (!window.google || !window.google.maps || !window.google.maps.geometry) {
            console.warn("Google Maps Geometry library not loaded!");
            return false; 
        }

        const MIN_DISTANCE_METERS = 30; // 👈 กำหนดระยะห่างขั้นต่ำ (เช่น 50 เมตร)
        const newPoint = new window.google.maps.LatLng(newLat, newLng);

        for (const loc of locations) {
            const existingPoint = new window.google.maps.LatLng(loc.lat, loc.lng);
            // คำนวณระยะทางเป็นเมตร
            const distance = window.google.maps.geometry.spherical.computeDistanceBetween(existingPoint, newPoint);
            
            if (distance < MIN_DISTANCE_METERS) {
                return true; // เจอจุดที่ใกล้เกินไป
            }
        }
        return false; // ไม่มีจุดใกล้เคียง
    };

    const handleConfirmPin = () => { 
        // --- ⭐ เพิ่มส่วนเช็กระยะห่าง ⭐ ---
        if (isTooCloseToExistingMarker(tempPin.lat, tempPin.lng)) {
            setShowTooCloseAlert(true);
            return; // หยุดการทำงาน ไม่เปิดฟอร์ม
        }
        // ----------------------------------

        setIsAddLocationModalOpen(true); 
        setPinningMode(false); 
        tempMarkerRef.current?.setMap(null); 
    }
    const handleCancelPin = () => { 
    setPinningMode(false); 
    setTempPin(null); 
    tempMarkerRef.current?.setMap(null); 
    
    
    // ⭐ NEW: กระตุ้นให้ useEffect ที่วาด Marker ทำงานซ้ำ
    // โดยตั้งค่า filterType ให้เป็นค่าเดิมของมันเอง (เช่น 'all' -> 'all') 
    // ซึ่งจะทำให้ dependency array เปลี่ยนแปลงในเชิงเทคนิค และสั่งวาดใหม่
    setFilterType(prev => prev); 
}
    const handleSubmissionSuccess = () => { setIsAddLocationModalOpen(false); setTempPin(null); setSubmissionStatus('waiting'); setTimeout(() => setSubmissionStatus(''), 4000); };
    // --- ⭐ Updated Zoom Handlers ⭐ ---
    const handleZoomIn = () => { if (mapInstanceRef.current) { mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1); } };
    const handleZoomOut = () => { if (mapInstanceRef.current) { mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1); } };
    // --- ⭐ Full Screen Image Handler ⭐ ---
    const openImageModal = (url) => { if (!url) return; setFullImageUrl(url); setIsImageModalOpen(true); };

    if (loadError) return <div className="flex items-center justify-center h-screen dark:bg-gray-900 text-red-500 dark:text-red-400 p-4 text-center">{loadError.message}</div>;

    // --- ⭐ JSX Structure (Includes Dark Mode, Profile, Full Screen Image, Guest Login Button) ⭐ ---
    return (
        <div className="relative w-screen h-[100dvh] overflow-hidden touch-none">
            <Toaster position="bottom-right" reverseOrder={false} />
            {/* Map Container */}
            <div ref={mapRef} className="w-full h-full bg-gray-300 dark:bg-gray-700">
                {/* Basic Loading based only on script load */}
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-400/50 dark:bg-gray-900/50 z-10">
                        <span className="text-white dark:text-gray-200 text-lg font-semibold animate-pulse">Loading Map Script...</span>
                    </div>
                 )}
            </div>

            {/* Selected Location Modal (with Full Screen Image capability) */}
            {/* Selected Location Modal (Glassmorphism + Navigation) */}
            {/* Selected Location Modal (Glassmorphism + Navigation + Animations ✨) */}
            <AnimatePresence>
                {localSelectedLocation && (
                    <motion.div
                        key="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 sm:p-6"
                        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} // สีพื้นหลังแบบเดิม
                        onClick={() => setSelectedLocation(null)}
                    >
                        <motion.div
                            key="modal-content"
                            // ✨ ตั้งค่า Animation ตอนเข้าและออก ✨
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            // Class เดิม (Glassmorphism)
                            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-white/20 dark:border-gray-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header ส่วนรูปภาพ */}
                            <div className="relative h-48 sm:h-56">
                                <img
                                    src={localSelectedLocation.imageUrl || "https://placehold.co/600x400?text=Image"}
                                    alt={localSelectedLocation.name}
                                    className="w-full h-full object-cover"
                                    onClick={() => openImageModal(localSelectedLocation.imageUrl)}
                                />
                                {/* ปุ่มปิด X */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} // ✨ เพิ่ม effect ตอนเอาเมาส์ชี้/กด
                                    onClick={() => setSelectedLocation(null)}
                                    className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </motion.button>
                                {/* ปุ่มขยายรูป */}
                                {localSelectedLocation.imageUrl && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={() => openImageModal(localSelectedLocation.imageUrl)}
                                        className="absolute bottom-3 right-3 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
                                    >
                                        <FullScreenIcon />
                                    </motion.button>
                                )}
                            </div>

                            {/* เนื้อหา */}
                            <div className="p-5 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold dark:text-white leading-tight">{localSelectedLocation.name}</h3>
                                    <div className="flex items-center mt-1 space-x-2">
                                        <StarRatingDisplay rating={localSelectedLocation.avgRating} count={localSelectedLocation.reviewCount} />
                                        <span className="text-gray-400">|</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{localSelectedLocation.type}</span>
                                    </div>
                                </div>

                                {/* ปุ่มนำทาง (Navigation Button) */}
                                <motion.a
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} // ✨ effect ปุ่มกด
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${localSelectedLocation.lat},${localSelectedLocation.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    นำทาง (Get Directions)
                                </motion.a>

                                {/* ส่วนแสดงราคา */}
                                <AnimatePresence>
                                    {showPrices && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 max-h-40 overflow-y-auto"
                                        >
                                           {/* ... เนื้อหาราคา เหมือนเดิม ... */}
                                            <h4 className="font-semibold text-sm mb-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service Rates</h4>
                                            <ul className="space-y-2">
                                                {localSelectedLocation.routes?.map((route, index) => (
                                                    <li key={index} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-700 dark:text-gray-200">{route.destination}</span>
                                                        <span className="font-bold text-blue-600 dark:text-blue-400">{route.price} ฿</span>
                                                    </li>
                                                ))}
                                                {(!localSelectedLocation.routes || localSelectedLocation.routes.length === 0) && <p className="text-xs text-gray-400">No price info.</p>}
                                            </ul>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action Buttons ด้านล่าง */}
                                <div className="grid grid-cols-4 gap-2 pt-2">
                                    {/* ผมเปลี่ยน button ธรรมดาเป็น motion.button และเพิ่ม whileHover/whileTap ให้ดูมีชีวิตชีวา */}
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleLike(localSelectedLocation)} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
                                        <LikeIcon isLiked={userLikes.has(localSelectedLocation.id)} />
                                        <span className={`text-xs mt-1 font-medium ${userLikes.has(localSelectedLocation.id) ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>{localSelectedLocation.likeCount || 0}</span>
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsReviewsModalOpen(true)} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition text-gray-500 dark:text-gray-400">
                                        <ReviewIcon />
                                        <span className="text-xs mt-1 font-medium">Review</span>
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowPrices(prev => !prev)} className={`flex flex-col items-center justify-center p-2 rounded-xl transition ${showPrices ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400'}`}>
                                        {showPrices ? <ImageIcon /> : <PriceIcon />}
                                        <span className="text-xs mt-1 font-medium">{showPrices ? 'Info' : 'Prices'}</span>
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => { if (user) { setIsReportModalOpen(true) } else { alert('Log in to report.') } }} className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition text-gray-500 dark:text-gray-400">
                                        <ReportIcon />
                                        <span className="text-xs mt-1 font-medium">Report</span>
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Other Modals (Reviews, Report, Image, Profile) */}
            {isReviewsModalOpen && selectedLocation && (<ReviewsModal location={selectedLocation} user={user} onClose={() => setIsReviewsModalOpen(false)} />)}
            {isReportModalOpen && selectedLocation && user && (<ReportModal location={selectedLocation} user={user} onClose={() => setIsReportModalOpen(false)} />)}
            {isImageModalOpen && (<ImageModal imageUrl={fullImageUrl} onClose={() => setIsImageModalOpen(false)} />)}
            {isProfileModalOpen && user && (<ProfileModal user={user} onClose={() => setIsProfileModalOpen(false)} />)}

            {/* ⭐ เพิ่ม NotificationModal เข้าไป */}
            {isNotificationOpen && (
                <NotificationModal 
                    notifications={notifications} 
                    onClose={handleCloseNotification} 
                />
            )}
            
            {/* ⭐ Pop-up แจ้งเตือนระยะห่าง (Too Close Alert) ⭐ */}
            {showTooCloseAlert && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setShowTooCloseAlert(false)}>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                        
                        {/* ไอคอนตกใจสีส้ม */}
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            ใกล้เกินไป!
                        </h3>
                        <p className="text-gray-500 dark:text-gray-300 mb-6 text-sm">
                            จุดที่คุณเลือกอยู่ใกล้กับหมุดที่มีอยู่แล้วมากเกินไป <br/>
                            กรุณาขยับออกห่างอย่างน้อย 30 เมตร
                        </p>

                        <button
                            onClick={() => setShowTooCloseAlert(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors duration-200"
                        >
                            ตกลง
                        </button>
                    </div>
                </div>
            )}

            {/* Pinning UI */}
            {pinningMode && (<div className="absolute top-0 left-0 right-0 p-4 bg-blue-600 text-white text-center z-20 flex justify-center items-center shadow-lg"><p className="font-semibold text-lg">{tempPin ? 'Location selected. Confirm or Cancel.' : 'Click map to place pin.'}</p><button onClick={handleCancelPin} className="ml-6 bg-white text-blue-600 font-bold py-1 px-4 rounded-full text-sm hover:bg-blue-100">Cancel</button></div>)}
            {tempPin && (<div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-4"><button onClick={handleConfirmPin} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 text-lg rounded-full shadow-lg">Confirm Pin</button><button onClick={handleCancelPin} className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-3 px-8 text-lg rounded-full shadow-lg">Cancel</button></div>)}
            {isAddLocationModalOpen && (<LocationFormModal initialCoords={tempPin} onSuccess={handleSubmissionSuccess} onClose={() => { setIsAddLocationModalOpen(false); setTempPin(null); }} />)}
            {submissionStatus === 'waiting' && (<div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 z-50 flex items-center justify-center" onClick={() => setSubmissionStatus('')}><div className="text-center p-8"><h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Waiting for approval</h2><p className="text-gray-600 dark:text-gray-400 mt-2">Submitted, waiting for admin approval.</p></div></div>)}

            {/* Search Results Panel */}
            {searchQuery.length > 0 && (<div className="absolute top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 z-30 shadow-lg p-6 flex flex-col"><div className="relative flex items-center mb-4"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"><SearchIcon/></span><input type="text" className="w-full pl-10 pr-10 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none dark:bg-gray-700 dark:text-gray-100" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." autoFocus /><button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div><ul className="space-y-2 overflow-y-auto">{searchResults.map((loc) => (<li key={loc.id} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg" onClick={() => handleSearchResultClick(loc)}><div className="mr-3 text-gray-400 dark:text-gray-500">{loc.type === 'motorcycle' ? <MotorcycleIcon/> : <BusIcon/>}</div><span className="text-gray-700 dark:text-gray-200">{loc.name}</span></li>))}{searchResults.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-4">No results.</p>}</ul></div>)}

            {/* User Menu Panel (Includes Dark Mode, Profile Edit, Guest Login) */}
            <div className={`absolute top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg z-30 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} w-80 p-6`}>
                 <div className="flex items-center space-x-4"><div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-2xl font-bold">{user ? (user.displayName || user.email)?.charAt(0).toUpperCase() : 'G'}</div><div><h3 className="font-bold text-lg dark:text-white">{user?.displayName || user?.email?.split('@')[0] || "Guest"}</h3>{user && <p className="text-sm text-gray-500 dark:text-gray-400">Joined {new Date(user.metadata.creationTime).toLocaleDateString()}</p>}</div></div>
                {user && <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 break-words">{user.email}</p>}
                <div className="border-t dark:border-gray-700 my-6"></div>
                <nav className="space-y-4">
                    
                    {/* Profile Button */}
                    {user && (<button onClick={() => {setIsProfileModalOpen(true); setMenuOpen(false);}} className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 w-full text-left"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span>Profile</span></button>)}
                    {/* Logout / Login Button */}
                    {user ? (<button onClick={handleSignOut} className="w-full flex items-center space-x-3 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg><span>Log out</span></button>)
                    : (<button onClick={() => setView('welcome')} className="w-full flex items-center space-x-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg><span>Login / Sign Up</span></button>)}
                </nav>
            </div>
            {isMenuOpen && <div onClick={() => setMenuOpen(false)} className="absolute inset-0 z-20 bg-black/40"></div>}

            {/* Map Controls Overlay */}
            <div className="absolute inset-0 p-4 md:p-6 flex flex-col pointer-events-none">
                <div className="w-full flex justify-between items-start pointer-events-auto"><button onClick={() => setMenuOpen(true)} className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><MenuIcon /></button><div className="text-center"><h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>EasyWay</h1></div><div className="w-12"></div></div>
                <div className="mt-4 w-full max-w-lg mx-auto pointer-events-auto"><div className="relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg"><input type="text" placeholder="Search..." className="w-full py-3 pl-5 pr-12 rounded-full focus:outline-none dark:bg-gray-800 dark:text-gray-100" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><button className="absolute right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"><SearchIcon /></button></div></div>
                <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col space-y-2 pointer-events-auto">
                    <button onClick={moveToCurrentLocation} className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><TargetIcon /></button>
                    <div className="bg-white dark:bg-gray-800 rounded-full shadow-md"><button onClick={handleZoomIn} className="p-3 block text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-full"><PlusIcon /></button><hr className="dark:border-gray-600"/><button onClick={handleZoomOut} className="p-3 block text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-full"><MinusIcon /></button></div>
                    <div className="bg-white dark:bg-gray-800 rounded-full shadow-md flex flex-col"><button onClick={() => setFilterType(prev => prev === 'songthaew' ? 'all' : 'songthaew')} className={`p-3 rounded-t-full ${filterType === 'songthaew' ? 'bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><BusIcon /></button><hr className="dark:border-gray-600"/><button onClick={() => setFilterType(prev => prev === 'motorcycle' ? 'all' : 'motorcycle')} className={`p-3 rounded-b-full ${filterType === 'motorcycle' ? 'bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><MotorcycleIcon /></button></div>
                </div>
                <div className="absolute bottom-4 left-4 pointer-events-auto">{user && !pinningMode && (<button onClick={() => setPinningMode(true)} className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600"><AddPinIcon /></button>)}</div>
            </div>
        </div>
        
    );
    
}

// --- App Main Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [view, setView] = useState('welcome');
    const [loading, setLoading] = useState(true);
    const [suspensionMessage, setSuspensionMessage] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // เช็กว่าเคยบันทึกไว้ไหม? หรือเช็กว่าเป็นกลางคืนไหม?
        const isDarkStored = localStorage.getItem('darkMode') === 'true';
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // ถ้าเคยบันทึกไว้ใช้ค่าบันทึก ถ้าไม่เคยให้ใช้ค่าระบบ
        const shouldUseDark = localStorage.getItem('darkMode') !== null ? isDarkStored : isSystemDark;

        setDarkMode(shouldUseDark);

        // สั่งเปลี่ยน Class ของ HTML
        if (shouldUseDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);
    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', newMode); // บันทึกค่า
        
        if (newMode) {
            document.documentElement.classList.add('dark'); // เพิ่ม class dark
        } else {
            document.documentElement.classList.remove('dark'); // ลบ class dark
        }
    };

    // --- ⭐⭐ LОGIC ที่แก้ไข ⭐⭐ ---
    // เราจะใช้ onSnapshot เพื่อเช็ก status ของผู้ใช้ใน Firestore แบบ Real-time
    useEffect(() => {
        let firestoreUnsubscribe = null; // ตัวแปรสำหรับเก็บ listener ของ Firestore

        // onAuthStateChanged จะบอกเราว่าผู้ใช้ Log in หรือไม่
        const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // ถ้ามี listener เก่าของ Firestore ค้างอยู่ ให้ยกเลิกก่อน
            if (firestoreUnsubscribe) {
                firestoreUnsubscribe();
                firestoreUnsubscribe = null;
            }
            
            setIsAdmin(false); // รีเซ็ตสิทธิ์ Admin

            if (currentUser) {
                // ผู้ใช้ Log in สำเร็จ (ผ่าน Auth)
                // ต่อไป: เราต้องเช็ก status ใน Firestore
                const userRef = doc(db, "users", currentUser.uid);
                
                // ใช้ onSnapshot เพื่อติดตาม status แบบ real-time
                // ถ้า Admin กด suspend, ผู้ใช้จะถูกเตะเป็น Guest ทันที
                // ใน App.js, ภายใน useEffect, ภายใน firestoreUnsubscribe = onSnapshot(userRef, ...)

                firestoreUnsubscribe = onSnapshot(userRef, (userDoc) => {
                    setSuspensionMessage(null); // ⭐ ล้างข้อความแจ้งเตือนทุกครั้งที่มีการอัปเดตข้อมูล

                    if (userDoc.exists()) {
                        const firestoreData = userDoc.data();

                        if (firestoreData.status === 'suspended') {
                            // ⭐ กรณี: ผู้ใช้ถูกระงับ
                            setSuspensionMessage("บัญชีของคุณถูกระงับการใช้งาน โปรดติดต่อผู้ดูแลระบบเพื่อขอข้อมูลเพิ่มเติม");
                            
                            // ตั้งค่า user เป็น null เพื่อยกเลิกสิทธิ์การเข้าถึงส่วนอื่นของแอป
                            setUser(null); 
                            setIsAdmin(false);
                            setLoading(false);
                            
                        } else {
                            // ⭐ กรณี: ผู้ใช้ active (Logic ใช้งานปกติ)
                            const userWithDisplayName = {
                                ...currentUser, 
                                displayName: firestoreData.displayName || currentUser.displayName, 
                            };

                            setUser(userWithDisplayName);

                            currentUser.getIdTokenResult(true).then((idTokenResult) => {
                                setIsAdmin(!!idTokenResult.claims.admin);
                                setLoading(false);
                            }).catch((error) => {
                                console.error("Token error:", error);
                                setIsAdmin(false);
                                setLoading(false);
                            });
                        }
                    } else {
                        // มี Auth แต่ไม่มีข้อมูลใน Firestore
                        setUser(null);
                        setIsAdmin(false);
                        setLoading(false);
                    }
                }, (error) => { /* ... */ });

            } else {
                // ผู้ใช้ Log out (Auth เป็น null)
                setUser(null);
                setIsAdmin(false);
                setLoading(false);
                setView('welcome');
            }
        });

        // Cleanup function ของ useEffect
        return () => {
            authUnsubscribe(); // ยกเลิก listener ของ Auth
            if (firestoreUnsubscribe) {
                firestoreUnsubscribe(); // ยกเลิก listener ของ Firestore
            }
        };
    }, []); // ทำงานแค่ครั้งเดียวตอนเริ่ม
    // --- ⭐⭐ จบ LОGIC ที่แก้ไข ⭐⭐ ---

    if (loading) return <div className="flex justify-center items-center h-screen dark:bg-gray-900"><span className="dark:text-white">Loading...</span></div>;
    if (suspensionMessage) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl text-center max-w-sm">
                <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ บัญชีถูกระงับการใช้งาน</h1>
                <p className="text-gray-700 dark:text-gray-300">
                    {suspensionMessage}
                </p>
                <button 
                    // ให้ผู้ใช้ Log Out เพื่อเคลียร์สถานะ Auth และล้างข้อความ
                    onClick={() => signOut(auth).then(() => setSuspensionMessage(null))} 
                    className="mt-6 w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200"
                >
                    ออกจากระบบ
                </button>
            </div>
        </div>
    );
}
    if (user) return isAdmin ? <AdminDashboard /> : <MapScreen user={user} setView={setView} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
    if (view === 'map') return <MapScreen user={null} setView={setView} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
    switch (view) { case 'login': return <LoginScreen setView={setView} />; case 'signup': return <SignUpScreen setView={setView} />; default: return <WelcomeScreen setView={setView} />; }
}