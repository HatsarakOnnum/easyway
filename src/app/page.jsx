//project
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';
import Tilt from 'react-parallax-tilt';
import confetti from 'canvas-confetti';
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
// --- ⭐ Glowing Border Button Component ⭐ ---
const GlowingButton = ({ children, onClick, type = "button", className }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      // เพิ่ม shadow-blue-500/50 ให้เงาฟุ้งขึ้น
      className={`relative inline-flex h-14 w-full overflow-hidden rounded-xl p-[2px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-2xl shadow-blue-600/40 transition-transform active:scale-95 group ${className}`}
    >
      {/* 1. แสงวิ่งวน (เปลี่ยนสีแสงให้สว่างขึ้น เป็น ขาว-ฟ้า) */}
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FFFFFF_0%,#3B82F6_50%,#FFFFFF_100%)]" />
      
      {/* 2. เนื้อปุ่มตรงกลาง (เปลี่ยนจากสีดำ เป็นไล่สี ฟ้า->ม่วง) */}
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 text-lg font-bold text-white backdrop-blur-3xl group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-200">
        {children}
      </span>
    </button>
  );
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
// const functions = getFunctions(app, 'us-central1'); // Assuming you revert/remove Cloud Functions for now
// --- ⭐ เพิ่มไอคอนธง (สำหรับปุ่ม Report) ⭐ ---
const FlagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {/* 👇👇 เปลี่ยน path ใหม่ตรงนี้ครับ 👇👇 */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4m0 0h14l-3 5 3 5H3" />
  </svg>
);
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

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
// เปลี่ยนจากรูปนิ้วโป้ง เป็นรูปหัวใจ ❤️ และเปลี่ยนสี active เป็น text-pink-500
const LikeIcon = ({ isLiked }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isLiked ? 'text-pink-500' : 'text-gray-700'}`} viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
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
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const EnvelopeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
// --- ไอคอนเสริมสำหรับ Admin ---
const BanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
// --- Authentication Screens ---
// --- Welcome Screen (Creative Animated Style) ---
// --- Welcome Screen (Cosmic Space Theme matched with Login) ---
// --- Welcome Screen (Cosmic Theme + Space Clouds + Page Transition) ---
// --- Welcome Screen (Cosmic Theme - Simple) ---
function WelcomeScreen({ setView }) {
    // ฟังก์ชันช่วยเปลี่ยนหน้า (เตรียมไว้เผื่ออนาคต)
    const handleSetView = (view) => {
        setView(view);
    }

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden bg-[#0f172a] flex flex-col justify-between text-white animate-page-enter">
            
            {/* --- CSS Animations & Global Styles (ฝังไว้ที่นี่ที่เดียวพอ) --- */}
            <style>{`
                /* Page Transition */
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-page-enter {
                    animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }

                /* Blobs Animation */
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob { animation: blob 10s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }

                /* Road & Bike Animation */
                @keyframes moveRoad {
                    0% { background-position: 0px 0; }
                    100% { background-position: -100px 0; }
                }
                @keyframes bounceBike {
                    0%, 100% { transform: translateY(0) rotate(0deg) scaleX(-1); }
                    50% { transform: translateY(-5px) rotate(1deg) scaleX(-1); }
                }
                .road-stripe {
                    background-image: linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.5) 50%);
                    background-size: 100px 20px;
                    animation: moveRoad 0.5s linear infinite;
                }
                .bike-bounce { animation: bounceBike 0.5s ease-in-out infinite; }

                /* Stars Animation */
                @keyframes twinkle {
                    0%, 100% { opacity: 0.8; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(0.8); }
                }
                .star {
                    position: absolute; background: white; border-radius: 50%;
                    animation: twinkle 3s infinite ease-in-out;
                }

                /* Cloud Animation */
                @keyframes floatingCloud {
                    0% { transform: translateX(100vw); opacity: 0; }
                    10% { opacity: var(--cloud-opacity); }
                    90% { opacity: var(--cloud-opacity); }
                    100% { transform: translateX(-200px); opacity: 0; }
                }
                .cloud-space {
                    position: absolute; fill: rgba(200, 220, 255, 0.15); filter: blur(8px);
                }
                .cloud-1 { --cloud-opacity: 0.2; animation: floatingCloud 45s linear infinite; top: 15%; }
                .cloud-2 { --cloud-opacity: 0.15; animation: floatingCloud 60s linear infinite; top: 30%; animation-delay: -20s; scale: 1.5; }
                .cloud-3 { --cloud-opacity: 0.3; animation: floatingCloud 50s linear infinite; top: 5%; animation-delay: -5s; scale: 0.8; }
            `}</style>

            {/* --- Space Background Layers (พื้นหลังอวกาศ) --- */}
            {/* Layer A: Nebula Blobs (แสงเนบิวลา) */}
            <div className="absolute inset-0 w-full h-[100dvh] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Layer B: Stars (ดาวระยิบระยับ) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="star w-1 h-1 top-10 left-10" style={{animationDelay: '0s'}}></div>
                <div className="star w-0.5 h-0.5 top-20 right-20" style={{animationDelay: '1s'}}></div>
                <div className="star w-1 h-1 top-1/2 left-1/3" style={{animationDelay: '2s'}}></div>
                <div className="star w-0.5 h-0.5 bottom-1/3 right-1/4" style={{animationDelay: '0.5s'}}></div>
                <div className="star w-1 h-1 top-1/4 right-1/3" style={{animationDelay: '1.5s'}}></div>
                <div className="star w-0.5 h-0.5 top-5 left-1/2 opacity-40"></div>
                <div className="star w-0.5 h-0.5 bottom-20 left-10 opacity-40"></div>
                <div className="star w-1 h-1 top-2/3 right-10 opacity-50" style={{animationDelay: '3s'}}></div>
            </div>

             {/* Layer C: Space Clouds (กลุ่มก๊าซ) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <svg className="cloud-space cloud-1" width="200" height="120" viewBox="0 0 24 24"><path d="M18.5 12A5.5 5.5 0 0 0 13 6.5C12.8 6.5 12.6 6.5 12.4 6.5A6.5 6.5 0 0 0 5.5 12.5v.5H5a5 5 0 1 0 0 10h13.5a5.5 5.5 0 0 0 0-11z"/></svg>
                <svg className="cloud-space cloud-2" width="200" height="120" viewBox="0 0 24 24"><path d="M18.5 12A5.5 5.5 0 0 0 13 6.5C12.8 6.5 12.6 6.5 12.4 6.5A6.5 6.5 0 0 0 5.5 12.5v.5H5a5 5 0 1 0 0 10h13.5a5.5 5.5 0 0 0 0-11z"/></svg>
                <svg className="cloud-space cloud-3" width="200" height="120" viewBox="0 0 24 24"><path d="M18.5 12A5.5 5.5 0 0 0 13 6.5C12.8 6.5 12.6 6.5 12.4 6.5A6.5 6.5 0 0 0 5.5 12.5v.5H5a5 5 0 1 0 0 10h13.5a5.5 5.5 0 0 0 0-11z"/></svg>
            </div>

            {/* --- Content & Action Area --- */}
            <div className="relative z-10 flex flex-col items-center pt-24 px-6 text-center space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full"></div>
                    <h1 className="relative text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 tracking-tighter drop-shadow-sm">EW</h1>
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-widest text-blue-100">EASYWAY</h2>
                    <p className="text-slate-400 text-sm mt-2 uppercase tracking-widest">The Future of Transit</p>
                </div>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center pb-0">


                <div className="w-full max-w-md px-6 pb-10 z-30">
                    {/* 👇👇 ใช้ Tilt ครอบ div เดิม แล้วใส่ options เพิ่ม 👇👇 */}
                    <Tilt 
                        tiltMaxAngleX={5}    // เอียงซ้ายขวาสูงสุด 5 องศา
                        tiltMaxAngleY={5}    // เอียงบนล่างสูงสุด 5 องศา
                        perspective={1000}   // ความลึก (ค่ายิ่งเยอะยิ่งดูแบน)
                        scale={1.02}         // ขยายขึ้นนิดหน่อยตอนเอาเมาส์ชี้
                        transitionSpeed={1500} // ความสมูทในการเอียง
                        className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-2xl space-y-3"
                    >
                        <button onClick={() => handleSetView('login')} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg shadow-lg shadow-blue-900/50 transition-all transform active:scale-95">
                            Login
                        </button>
                        <button onClick={() => handleSetView('signup')} className="w-full py-3.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold text-lg transition-all transform active:scale-95">
                            Create Account
                        </button>
                        <button onClick={() => handleSetView('map')} className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors">
                            Continue as Guest →
                        </button>
                    </Tilt>
                    {/* 👆👆 ปิด Tag Tilt 👆👆 */}
                </div>

                <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-slate-900 to-transparent z-0"></div>
                <div className="w-full h-32 bg-slate-800 relative overflow-hidden border-t border-blue-500/30 shadow-[0_-10px_50px_rgba(59,130,246,0.2)]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-2 -mt-1 road-stripe w-[200%]"></div>
                </div>
            </div>
        </div>
    );
}
// --- Sign Up Screen (Modern Glassmorphism Design) ---
// --- Sign Up Screen (Updated with Cosmic Space Background) ---
// --- Sign Up Screen (Cosmic Space Theme) ---
// --- Sign Up Screen (Fixed: Animation & Icons match Login) ---
function SignUpScreen({ setView }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault(); 
        setError('');
        if (password.length < 6) {
            setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                createdAt: serverTimestamp(),
                status: 'active',
                displayName: email.split('@')[0]
            });
            
            await updateProfile(user, { displayName: email.split('@')[0] });
            
            // สมัครเสร็จแล้วอาจจะให้ไปหน้าไหนต่อ? (ปกติระบบ Auth จะพาไปหน้า Map อัตโนมัติถ้าใช้ onAuthStateChanged)
        } catch (err) {
            console.error(err);
            setError("ไม่สามารถสร้างบัญชีได้ อีเมลนี้อาจถูกใช้ไปแล้ว");
        }
    };

    // สไตล์ (ชุดเดียวกับ LoginScreen)
    const inputContainerStyle = "relative group transition-all duration-300 transform hover:-translate-y-0.5";
    const inputStyle = "w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/10 border-2 border-transparent focus:border-blue-500 focus:bg-slate-900/50 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 outline-none text-white placeholder-slate-400 font-medium shadow-sm group-hover:shadow-md";
    const iconStyle = "absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors duration-300";

    return (
        <div className="relative min-h-[100dvh] w-full flex items-center justify-center bg-[#0f172a] overflow-hidden animate-page-enter">
            
            {/* --- CSS Animations (ต้องใส่ไว้เพื่อให้หน้านี้ขยับได้ด้วย) --- */}
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob { animation: blob 10s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                @keyframes moveRoad {
                    0% { background-position: 0px 0; }
                    100% { background-position: -100px 0; }
                }
                .road-stripe {
                    background-image: linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.5) 50%);
                    background-size: 100px 20px;
                    animation: moveRoad 0.5s linear infinite;
                }
                /* Cloud Animation */
                @keyframes floatingCloud {
                    0% { transform: translateX(100vw); opacity: 0; }
                    10% { opacity: var(--cloud-opacity); }
                    90% { opacity: var(--cloud-opacity); }
                    100% { transform: translateX(-200px); opacity: 0; }
                }
                .cloud-space {
                    position: absolute; fill: rgba(200, 220, 255, 0.15); filter: blur(8px);
                }
                .cloud-1 { --cloud-opacity: 0.2; animation: floatingCloud 45s linear infinite; top: 15%; }
                .cloud-2 { --cloud-opacity: 0.15; animation: floatingCloud 60s linear infinite; top: 30%; animation-delay: -20s; scale: 1.5; }
                .cloud-3 { --cloud-opacity: 0.3; animation: floatingCloud 50s linear infinite; top: 5%; animation-delay: -5s; scale: 0.8; }
            `}</style>

            {/* --- Background Layers (เหมือนหน้า Login เป๊ะๆ) --- */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                {/* 1. Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>

                {/* Clouds */}
                <div className="absolute inset-0 overflow-hidden">
                    <svg className="cloud-space cloud-1" width="200" height="120" viewBox="0 0 24 24"><path d="M18.5 12A5.5 5.5 0 0 0 13 6.5C12.8 6.5 12.6 6.5 12.4 6.5A6.5 6.5 0 0 0 5.5 12.5v.5H5a5 5 0 1 0 0 10h13.5a5.5 5.5 0 0 0 0-11z"/></svg>
                    <svg className="cloud-space cloud-2" width="200" height="120" viewBox="0 0 24 24"><path d="M18.5 12A5.5 5.5 0 0 0 13 6.5C12.8 6.5 12.6 6.5 12.4 6.5A6.5 6.5 0 0 0 5.5 12.5v.5H5a5 5 0 1 0 0 10h13.5a5.5 5.5 0 0 0 0-11z"/></svg>
                    <svg className="cloud-space cloud-3" width="200" height="120" viewBox="0 0 24 24"><path d="M18.5 12A5.5 5.5 0 0 0 13 6.5C12.8 6.5 12.6 6.5 12.4 6.5A6.5 6.5 0 0 0 5.5 12.5v.5H5a5 5 0 1 0 0 10h13.5a5.5 5.5 0 0 0 0-11z"/></svg>
                </div>

                {/* 3. Moving Road */}
                <div className="absolute bottom-0 w-full z-0">
                     <div className="w-full h-40 bg-gradient-to-t from-slate-900 to-transparent"></div>
                     <div className="w-full h-32 bg-slate-800 relative overflow-hidden border-t border-blue-500/30 shadow-[0_-10px_50px_rgba(59,130,246,0.2)]">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-2 -mt-1 road-stripe w-[200%]"></div>
                    </div>
                </div>
            </div>

            {/* --- Glass Card Form --- */}
            <Tilt 
                tiltMaxAngleX={3} 
                tiltMaxAngleY={3} 
                perspective={1000} 
                scale={1.01}
                transitionSpeed={2000}
                className="relative z-10 w-full max-w-md p-8 mx-4 bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10"
            >
                
                {/* Back Button */}
                <button onClick={() => setView('welcome')} className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <BackIcon />
                </button>

                <div className="text-center mb-8 pt-2">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 tracking-tight pb-2 pr-2 inline-block">
                        Create Account
                    </h1>
                    <p className="text-slate-300 font-medium">Join EasyWay today!</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-900/30 text-red-300 text-sm rounded-xl border border-red-800 flex items-center shadow-sm animate-pulse">
                       ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-5">
                    {/* Email Input */}
                    <div className={inputContainerStyle}>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-wide">Email</label>
                        <div className="relative">
                            <div className={iconStyle}><EnvelopeIcon /></div>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                className={inputStyle} 
                                placeholder="name@example.com" 
                                required 
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className={inputContainerStyle}>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-wide">Password</label>
                        <div className="relative">
                            <div className={iconStyle}><LockIcon /></div>
                            <input 
                                type={passwordVisible ? "text" : "password"} 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className={`${inputStyle} pr-12`} 
                                placeholder="Min. 6 characters" 
                                required 
                            />
                            
                            {/* ปุ่มดูรหัสผ่าน (ใช้ EyeSlashIcon / EyeIcon) */}
                            <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors">
                                <EyeIcon closed={passwordVisible} />
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <GlowingButton type="submit">
                        Create Account
                    </GlowingButton>
                </form>

                <p className="mt-8 text-center text-slate-400 text-sm">
                    Already have an account?{' '}
                    <button onClick={() => setView('login')} className="text-blue-400 font-bold hover:underline transition-colors">
                        Login
                    </button>
                </p>
            </Tilt>
        </div>
    );
}

// --- Login Screen (Modern Glassmorphism Design) ---
// --- Login Screen (Updated with Cosmic Space Background) ---
// --- Login Screen (Modern Glassmorphism Design) ---
function LoginScreen({ setView }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault(); 
        setError('');
        try { 
            await signInWithEmailAndPassword(auth, email, password); 
        } catch (err) { 
            console.error(err); 
            setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง"); 
        }
    };

    // (Keep your existing handleGoogleSignIn logic here if needed)
     const handleGoogleSignIn = async () => {
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userRef = doc(db, "users", user.uid);
            
            // ใช้ setDoc แบบ merge: true เพื่ออัปเดตข้อมูล (เช่น รูปโปรไฟล์เปลี่ยน) โดยไม่ลบข้อมูลเก่า
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || null, // ⭐ บันทึก URL รูปภาพตรงนี้
                lastLogin: serverTimestamp(),
                // เช็กว่ามี status หรือยัง ถ้าไม่มีให้เป็น active
            }, { merge: true }); 
            
            // เช็กเพิ่มกรณีสร้างใหม่จริงๆ เพื่อใส่ createdAt (ถ้าจำเป็น) หรือใช้ logic เดิมของคุณก็ได้
            const userSnap = await getDoc(userRef);
            if (!userSnap.data().createdAt) {
                 await updateDoc(userRef, { createdAt: serverTimestamp(), status: 'active' });
            } else if (userSnap.data().status === 'suspended') {
                setError("บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแล");
                await signOut(auth);
                return;
            }

        } catch (err) {
            console.error("Google Sign-In Error:", err);
            if (err.code !== 'auth/popup-closed-by-user') setError("Failed to sign in with Google.");
        }
    };

    // Define styles for inputs
    const inputContainerStyle = "relative group transition-all duration-300 transform hover:-translate-y-0.5";
    const inputStyle = "w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border-2 border-transparent focus:border-blue-500 focus:bg-slate-900/50 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 outline-none text-white placeholder-slate-400 font-medium shadow-sm group-hover:shadow-md";
    const iconStyle = "absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors duration-300";


    return (
        <div className="relative min-h-[100dvh] w-full flex items-center justify-center bg-[#0f172a] overflow-hidden animate-page-enter">
            
            {/* --- Animation Styles --- */}
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob { animation: blob 10s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.8; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(0.8); }
                }
                .star {
                    position: absolute; background: white; border-radius: 50%;
                    animation: twinkle 3s infinite ease-in-out;
                }
                @keyframes moveRoad {
                    0% { background-position: 0px 0; }
                    100% { background-position: -100px 0; }
                }
                 .road-stripe {
                    background-image: linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.5) 50%);
                    background-size: 100px 20px;
                    animation: moveRoad 0.5s linear infinite;
                }
                 /* Cloud Animation */
                @keyframes floatingCloud {
                    0% { transform: translateX(100vw); opacity: 0; }
                    10% { opacity: var(--cloud-opacity); }
                    90% { opacity: var(--cloud-opacity); }
                    100% { transform: translateX(-200px); opacity: 0; }
                }
                .cloud-space {
                    position: absolute; fill: rgba(200, 220, 255, 0.15); filter: blur(8px);
                }
                .cloud-1 { --cloud-opacity: 0.2; animation: floatingCloud 45s linear infinite; top: 15%; }
                .cloud-2 { --cloud-opacity: 0.15; animation: floatingCloud 60s linear infinite; top: 30%; animation-delay: -20s; scale: 1.5; }
                .cloud-3 { --cloud-opacity: 0.3; animation: floatingCloud 50s linear infinite; top: 5%; animation-delay: -5s; scale: 0.8; }

            `}</style>

            {/* --- Background Layers --- */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                 {/* Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>
                
                 {/* Stars */}
                <div className="absolute inset-0">
                    <div className="star w-1 h-1 top-10 left-10" style={{animationDelay: '0s'}}></div>
                    <div className="star w-0.5 h-0.5 top-20 right-20" style={{animationDelay: '1s'}}></div>
                    <div className="star w-1 h-1 top-1/2 left-1/3" style={{animationDelay: '2s'}}></div>
                    <div className="star w-0.5 h-0.5 bottom-1/3 right-1/4" style={{animationDelay: '0.5s'}}></div>
                     <div className="star w-0.5 h-0.5 top-5 left-1/2 opacity-40"></div>
                </div>

                 {/* Clouds */}
                <div className="absolute inset-0 overflow-hidden">
                    <svg className="cloud-space cloud-1" width="200" height="120" viewBox="0 0 24 24"><path d="M18.5 12A5.5 5.5 0 0 0 13 6.5C12.8 6.5 12.6 6.5 12.4 6.5A6.5 6.5 0 0 0 5.5 12.5v.5H5a5 5 0 1 0 0 10h13.5a5.5 5.5 0 0 0 0-11z"/></svg>
                    <svg className="cloud-space cloud-2" width="200" height="120" viewBox="0 0 24 24"><path d="M18.5 12A5.5 5.5 0 0 0 13 6.5C12.8 6.5 12.6 6.5 12.4 6.5A6.5 6.5 0 0 0 5.5 12.5v.5H5a5 5 0 1 0 0 10h13.5a5.5 5.5 0 0 0 0-11z"/></svg>
                    <svg className="cloud-space cloud-3" width="200" height="120" viewBox="0 0 24 24"><path d="M18.5 12A5.5 5.5 0 0 0 13 6.5C12.8 6.5 12.6 6.5 12.4 6.5A6.5 6.5 0 0 0 5.5 12.5v.5H5a5 5 0 1 0 0 10h13.5a5.5 5.5 0 0 0 0-11z"/></svg>
                </div>

                 {/* Moving Road */}
                <div className="absolute bottom-0 w-full z-0">
                     <div className="w-full h-40 bg-gradient-to-t from-slate-900 to-transparent"></div>
                     <div className="w-full h-32 bg-slate-800 relative overflow-hidden border-t border-blue-500/30 shadow-[0_-10px_50px_rgba(59,130,246,0.2)]">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-2 -mt-1 road-stripe w-[200%]"></div>
                    </div>
                </div>
            </div>

            {/* --- Glass Card --- */}
            <Tilt 
                tiltMaxAngleX={3} 
                tiltMaxAngleY={3} 
                perspective={1000} 
                scale={1.01}
                transitionSpeed={2000}
                className="relative z-10 w-full max-w-md p-8 mx-4 bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 my-10"
            >
                
                {/* ⭐ Back Button (Inside the Card, Top Left) ⭐ */}
                <button 
                    onClick={() => setView('welcome')} 
                    className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all z-20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>

                <div className="text-center mb-8 pt-2">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 tracking-tight pb-2 pr-2 inline-block">
                        EasyWay
                    </h1>
                    <p className="text-slate-300 font-medium">Welcome Back!</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-900/30 text-red-300 text-sm rounded-xl border border-red-800 flex items-center shadow-sm animate-pulse">
                       ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email Input */}
                    <div className={inputContainerStyle}>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-wide">Email</label>
                        <div className="relative">
                            <div className={iconStyle}><EnvelopeIcon /></div>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputStyle} placeholder="name@example.com" required />
                        </div>
                    </div>
                    {/* Password Input */}
                    <div className={inputContainerStyle}>
                        <div className="flex justify-between ml-1 mb-1.5">
                             <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Password</label>
                             <button type="button" onClick={() => setIsPasswordResetOpen(true)} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">Forgot?</button>
                        </div>
                        <div className="relative">
                            <div className={iconStyle}><LockIcon /></div>
                            <input type={passwordVisible ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className={`${inputStyle} pr-12`} placeholder="••••••••" required />
                            <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors">
                                <EyeIcon closed={passwordVisible} />
                            </button>
                        </div>
                    </div>
                    <GlowingButton type="submit">
                        Sign In
                    </GlowingButton>
                </form>

                 {/* Google Button */}
                 <div className="mt-6">
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full py-3.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold flex items-center justify-center transition-all duration-300 hover:shadow-md group active:scale-[0.98]"
                    >
                        <GoogleIcon /> 
                        <span className="ml-3">Sign in with Google</span>
                    </button>
                </div>

                <p className="mt-8 text-center text-slate-400 text-sm">
                    Don't have an account?{' '}
                    <button onClick={() => setView('signup')} className="text-blue-400 font-bold hover:underline transition-colors">
                        Sign Up
                    </button>
                </p>
            </Tilt>
            {isPasswordResetOpen && <PasswordResetModal onClose={() => setIsPasswordResetOpen(false)} />}
        </div>
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
    const [sortOrder, setSortOrder] = useState('desc');

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
        const actionVerb = newStatus === 'active' ? 'ปลดแบน (Activate)' : 'ระงับการใช้งาน (Suspend)';
        
        if (window.confirm(`ยืนยันการ ${actionVerb} ผู้ใช้ ${user.email}?`)) {
            try {
                const userRef = doc(db, "users", user.id);
                await updateDoc(userRef, { status: newStatus });
                toast.success(`สถานะเปลี่ยนเป็น ${newStatus} เรียบร้อย`);
            } catch (error) {
                console.error(error);
                toast.error(`เกิดข้อผิดพลาด`);
            }
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        const dateA = a.createdAt?.toMillis() || 0;
        const dateB = b.createdAt?.toMillis() || 0;
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const filteredUsers = sortedUsers.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleSortOrder = () => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');

    return (
        <div className="dark:text-gray-200">
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Manage Users</h2>
                
                <div className="flex flex-col w-full md:w-auto gap-3 md:flex-row md:items-center">
                    <input
                        type="text"
                        placeholder="Search by email..."
                        className="w-full md:w-64 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex gap-2 w-full md:w-auto">
                        <button 
                            onClick={toggleSortOrder} 
                            className="flex-1 md:flex-none justify-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded flex items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap"
                        >
                            <span className="mr-2">{sortOrder === 'desc' ? '⬇' : '⬆'}</span> Date
                        </button>
                        <button 
                            onClick={() => handleOpenModal()} 
                            className="flex-1 md:flex-none justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
                        >
                            Add User
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 📱 Mobile View (ใช้แบบเดิมตามที่คุณต้องการ) --- */}
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

            {/* --- 💻 Desktop View (Table ใหม่ สวยงาม) --- */}
            <div className="hidden md:block bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 text-left">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Info</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-500 transition" onClick={toggleSortOrder}>
                                Joined Date {sortOrder === 'desc' ? '↓' : '↑'}
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                {/* ช่อง 1: User Info พร้อม Avatar */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        {/* ⭐ ส่วนแสดงรูปภาพ (Avatar) ⭐ */}
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600">
                                            {user.photoURL ? (
                                                <img 
                                                    src={user.photoURL} 
                                                    alt="" 
                                                    className="h-full w-full object-cover" 
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        {/* จบส่วนรูปภาพ */}

                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                {user.displayName || 'No Name'}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                
                                {/* ช่อง 2: วันที่ */}
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                                        {user.createdAt?.toDate().toLocaleDateString()}
                                    </span>
                                </td>

                                {/* ช่อง 3: Status Badge แบบใหม่ */}
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                        user.status === 'suspended'
                                        ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                        : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'suspended' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                        {user.status === 'suspended' ? 'Suspended' : 'Active'}
                                    </span>
                                </td>

                                {/* ช่อง 4: ปุ่มกดแบบไอคอน */}
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleToggleUserStatus(user)}
                                        title={user.status === 'suspended' ? "Click to Activate" : "Click to Suspend"}
                                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all shadow-sm ${
                                            user.status === 'suspended'
                                            ? 'bg-green-100 text-green-600 hover:bg-green-200 hover:scale-110 dark:bg-green-900/30'
                                            : 'bg-red-100 text-red-600 hover:bg-red-200 hover:scale-110 dark:bg-red-900/30'
                                        }`}
                                    >
                                        {user.status === 'suspended' ? <CheckCircleIcon /> : <BanIcon />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        No users found.
                    </div>
                )}
            </div>
            
            {isModalOpen && <UserFormModal currentUser={editingUser} onClose={handleCloseModal} />}
        </div>
    );
};

// --- ⭐ User Form Modal (Component ที่หายไป) ⭐ ---
const UserFormModal = ({ currentUser, onClose }) => {
    const [email, setEmail] = useState(currentUser?.email || '');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [status, setStatus] = useState(currentUser?.status || 'active');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // กรณีสร้าง User ใหม่
            if (!currentUser) {
                // ⚠️ หมายเหตุ: การ create user ด้วย Client SDK จะทำให้ Admin ถูก Log out
                // ในระบบจริงควรใช้ Firebase Cloud Functions
                // แต่เพื่อความง่ายในตอนนี้ เราจะแค่ "สร้าง Database" ไปก่อน (User ต้องไป Sign up เอง หรือใช้วิธีอื่น)
                
                // เช็กว่า Password สั้นไปไหม
                if (password.length < 6) {
                     toast.error("Password ต้องยาวกว่า 6 ตัวอักษร");
                     setLoading(false);
                     return;
                }

                // สร้าง User ผ่าน Auth (ระวัง: Admin จะหลุด)
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // บันทึกลง Firestore
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: displayName,
                    status: status,
                    createdAt: serverTimestamp(),
                });
                
                toast.success("สร้าง User สำเร็จ! (คุณอาจต้อง Login ใหม่)");
            } 
            // กรณีแก้ไข User เดิม
            else {
                const userRef = doc(db, "users", currentUser.id);
                await updateDoc(userRef, {
                    displayName: displayName,
                    status: status,
                    // email: email // ปกติไม่ค่อยให้แก้ email กันง่ายๆ
                });
                toast.success("อัปเดตข้อมูลสำเร็จ!");
            }
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาด: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {currentUser ? 'Edit User' : 'Add New User'}
                    </h3>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            disabled={!!currentUser} // แก้ไขไม่ได้ถ้าเป็น User เก่า
                            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white disabled:opacity-60"
                            required
                        />
                    </div>

                    {/* Password (เฉพาะตอนสร้างใหม่) */}
                    {!currentUser && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                required
                            />
                        </div>
                    )}

                    {/* Display Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                        <input 
                            type="text" 
                            value={displayName} 
                            onChange={e => setDisplayName(e.target.value)} 
                            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select 
                            value={status} 
                            onChange={e => setStatus(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                        >
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 transition">
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- ⭐ My Pins Modal (ดูรายการหมุดของตัวเอง) ⭐ ---
const MyPinsModal = ({ user, onClose, onSelectLocation }) => {
    const [myLocations, setMyLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        // ดึงเฉพาะหมุดที่ submittedBy = uid ของเรา
        const q = query(collection(db, "locations"), where("submittedBy", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            // เรียงลำดับ: เรียงตามวันที่สร้าง (ใหม่สุดขึ้นก่อน)
            const locs = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
            setMyLocations(locs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        📍 My Pins <span className="text-sm font-normal text-gray-500">({myLocations.length})</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* List (Updated Design) */}
                <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/20">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400 animate-pulse">Loading...</div>
                    ) : myLocations.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                            <span className="text-5xl mb-3 grayscale opacity-50">📍</span>
                            <p className="font-medium">No pins yet</p>
                        </div>
                    ) : (
                        myLocations.map(loc => (
                            <div 
                                key={loc.id} 
                                onClick={() => onSelectLocation(loc)}
                                className="group relative bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex gap-4 overflow-hidden"
                            >
                                {/* แถบสีสถานะด้านซ้าย */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                                    loc.status === 'approved' ? 'bg-gradient-to-b from-green-400 to-green-600' :
                                    loc.status === 'rejected' ? 'bg-gradient-to-b from-red-400 to-red-600' :
                                    'bg-gradient-to-b from-yellow-300 to-yellow-500'
                                }`} />

                                {/* รูปภาพ */}
                                <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden relative shadow-inner">
                                    <img 
                                        src={loc.imageUrl || "https://placehold.co/100x100?text=No+Img"} 
                                        alt="" 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                    />
                                    {/* ไอคอนประเภทรถมุมขวาล่าง */}
                                    <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md p-1 rounded-lg text-white shadow-sm">
                                        {loc.type === 'motorcycle' ? <MotorcycleIcon /> : <BusIcon />} 
                                    </div>
                                </div>

                                {/* ข้อมูล */}
                                <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-gray-800 dark:text-white truncate text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {loc.name}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            📅 {loc.createdAt?.toDate().toLocaleDateString('th-TH')}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex justify-between items-end mt-2">
                                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                            loc.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                                            loc.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                                            'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                                        }`}>
                                            {loc.status === 'pending' ? '⏳ Wait Approval' : loc.status}
                                        </span>
                                        
                                        <span className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform">
                                            View ➝
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// --- ⭐ Favorites Modal (หน้ารายการที่กด Like ไว้) ⭐ ---
const FavoritesModal = ({ locations, userLikes, onClose, onSelectLocation }) => {
    // กรองเอาเฉพาะ Location ที่ ID อยู่ใน userLikes
    const favoriteLocations = locations.filter(loc => userLikes.has(loc.id));

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-pink-50 dark:bg-pink-900/20">
                    <h3 className="text-xl font-bold text-pink-600 dark:text-pink-400 flex items-center gap-2">
                        ❤️ Favorites <span className="text-sm font-normal text-gray-500">({favoriteLocations.length})</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/20">
                    {favoriteLocations.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                            <span className="text-5xl mb-3 grayscale opacity-50">💔</span>
                            <p className="font-medium">No favorites yet</p>
                            <p className="text-xs mt-1">Click the heart icon on any pin to save it here.</p>
                        </div>
                    ) : (
                        favoriteLocations.map(loc => (
                            <div 
                                key={loc.id} 
                                onClick={() => onSelectLocation(loc)}
                                className="group relative bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex gap-4 overflow-hidden"
                            >
                                {/* รูปภาพ */}
                                <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden relative shadow-inner">
                                    <img 
                                        src={loc.imageUrl || "https://placehold.co/100x100?text=No+Img"} 
                                        alt="" 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                    />
                                    <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md p-1 rounded-lg text-white shadow-sm">
                                        {loc.type === 'motorcycle' ? <MotorcycleIcon /> : <BusIcon />} 
                                    </div>
                                </div>

                                {/* ข้อมูล */}
                                <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-white truncate text-lg leading-tight group-hover:text-pink-500 transition-colors">
                                            {loc.name}
                                        </h4>
                                        <div className="flex items-center gap-1 mt-1">
                                            <StarIcon className="w-3 h-3 text-yellow-400" filled />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {loc.avgRating ? loc.avgRating.toFixed(1) : 'New'} ({loc.reviewCount || 0})
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end mt-2">
                                        <span className="text-xs text-pink-400 group-hover:translate-x-1 transition-transform font-semibold">
                                            Go to Pin ➝
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};


// --- ⭐ Manage Locations (Redesigned) ⭐ ---
// --- ⭐ Manage Locations (รับ Props จาก AdminDashboard) ⭐ ---
const ManageLocations = ({ onViewLocation, currentFilter, setFilter, onApprove, onDelete }) => {
    const [locations, setLocations] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // ❌ ลบ const [statusFilter, setStatusFilter] = useState('pending'); ออก (ใช้ currentFilter แทน)

    useEffect(() => {
        // ใช้ currentFilter ที่ส่งมาจาก AdminDashboard
        const q = query(collection(db, "locations"), where("status", "==", currentFilter));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const locsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLocations(locsData);
        });
        return () => unsubscribe();
    }, [currentFilter]);

    const handleOpenModal = (loc = null) => { setCurrentLocation(loc); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setCurrentLocation(null); };

    // ❌ ลบ handleDelete และ handleApprove ในนี้ออกให้หมด (เพราะเราส่ง onApprove, onDelete มาจาก AdminDashboard แล้ว)

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dark:text-gray-200 p-2 sm:p-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                        Manage Locations
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Total {currentFilter}: {locations.length}
                    </p>
                </div>
                <div className="flex flex-col w-full md:w-auto gap-3 md:flex-row md:items-center">
                    <div className="relative w-full md:w-64">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
                        <input
                            type="text"
                            placeholder="Search locations..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => handleOpenModal()} 
                        className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <PlusIcon /> <span>Add Pin</span>
                    </button>
                </div>
            </div>

            {/* Tabs (ใช้ currentFilter/setFilter แทน) */}
            <div className="flex space-x-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-full md:w-fit">
                <button
                    onClick={() => setFilter('pending')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                        currentFilter === 'pending'
                            ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow-sm scale-105'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <span>⏳ Pending Requests</span>
                    {currentFilter === 'pending' && locations.length > 0 && (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">{locations.length}</span>
                    )}
                </button>
                
                <button
                    onClick={() => setFilter('approved')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                        currentFilter === 'approved'
                            ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm scale-105'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <span>✅ Approved Locations</span>
                </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 text-left">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location Info</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredLocations.map(loc => (
                            <tr key={loc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                            <img src={loc.imageUrl || "https://placehold.co/100"} alt="" className="h-full w-full object-cover" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{loc.name}</div>
                                            <div className="text-xs text-gray-500">Added: {loc.createdAt?.toDate().toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        loc.type === 'motorcycle' 
                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' 
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    }`}>
                                        {loc.type === 'motorcycle' ? '🛵 Motorbike' : '🚌 Songthaew'}
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                        loc.status === 'pending'
                                        ? 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                                        : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${loc.status === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                                        {loc.status === 'pending' ? 'Waiting Approval' : 'Active'}
                                    </span>
                                </td>

                                {/* Actions: ใช้ onApprove / onDelete ที่ส่งมา */}
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => onViewLocation(loc)} 
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition border border-transparent hover:border-blue-200"
                                        >
                                            <TargetIcon /> View
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleOpenModal(loc)} 
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition border border-transparent hover:border-gray-300"
                                        >
                                            <span className="text-sm">✏️</span> Edit
                                        </button>

                                        {currentFilter === 'pending' && (
                                            <button 
                                                onClick={() => onApprove(loc)} 
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition border border-transparent hover:border-green-300"
                                            >
                                                <CheckCircleIcon /> Approve
                                            </button>
                                        )}

                                        <button 
                                            onClick={() => onDelete(loc)} 
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition border border-transparent hover:border-red-200"
                                        >
                                            <TrashIcon /> {currentFilter === 'pending' ? 'Reject' : 'Delete'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLocations.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <span className="text-4xl block mb-2 opacity-50">📭</span>
                        No {currentFilter} locations found.
                    </div>
                )}
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredLocations.map(loc => (
                    <div key={loc.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${currentFilter === 'pending' ? 'bg-yellow-400' : 'bg-green-500'}`} />
                        <div className="flex gap-4 pl-3">
                            <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                <img src={loc.imageUrl || "https://placehold.co/150"} alt={loc.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white truncate text-lg">{loc.name}</h3>
                                    <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 rounded text-gray-500 capitalize mt-1">
                                        {loc.type === 'motorcycle' ? '🛵 Win' : '🚌 Bus'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{loc.createdAt?.toDate().toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4 pl-3">
                            <button onClick={() => onViewLocation(loc)} className="flex-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 py-2 rounded-xl text-sm font-bold">View</button>
                            <button onClick={() => handleOpenModal(loc)} className="flex-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 py-2 rounded-xl text-sm font-bold">Edit</button>
                            {currentFilter === 'pending' ? (
                                <>
                                    <button onClick={() => onApprove(loc)} className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-bold shadow-lg shadow-green-500/30">Approve</button>
                                    <button onClick={() => onDelete(loc)} className="w-10 flex items-center justify-center bg-red-100 text-red-500 dark:bg-red-900/30 rounded-xl"><TrashIcon/></button>
                                </>
                            ) : (
                                <button onClick={() => onDelete(loc)} className="w-10 flex items-center justify-center bg-red-100 text-red-500 dark:bg-red-900/30 rounded-xl"><TrashIcon/></button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && <LocationFormModal currentLocation={currentLocation} onClose={handleCloseModal} onSuccess={handleCloseModal}/>}
        </div>
    );
};

// --- ⭐ Reject Reason Modal (New Component) ⭐ ---
const RejectModal = ({ location, onClose, onConfirm }) => {
    const [reasonType, setReasonType] = useState('ข้อมูลไม่ถูกต้อง (Incorrect Info)');
    const [customReason, setCustomReason] = useState('');
    const [loading, setLoading] = useState(false);

    const predefinedReasons = [
        "ข้อมูลไม่ถูกต้อง (Incorrect Info)",
        "รูปภาพไม่ชัดเจน/ไม่เหมาะสม (Inappropriate Image)",
        "ชื่อสถานที่หยาบคาย (Inappropriate Name)",
        "ตำแหน่งหมุดผิดพลาด (Wrong Location)",
        "หมุดซ้ำซ้อน (Duplicate Pin)",
        "อื่นๆ (Other)"
    ];

    const handleSubmit = () => {
        setLoading(true);
        // ถ้าเลือก "อื่นๆ" ให้ใช้ข้อความที่พิมพ์เอง, ถ้าเลือกช้อยส์ ให้ใช้ช้อยส์ + ข้อความขยายความ
        const finalReason = reasonType === 'อื่นๆ (Other)' 
            ? customReason 
            : `${reasonType} ${customReason ? '- ' + customReason : ''}`;
        
        onConfirm(location, finalReason);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        ❌ Reject / Delete
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        ระบุเหตุผลที่ปฏิเสธ/ลบหมุด: <span className="font-semibold text-blue-500">{location.name}</span>
                    </p>

                    <div className="space-y-4">
                        {/* Dropdown เลือกเหตุผล */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">สาเหตุหลัก</label>
                            <select 
                                value={reasonType} 
                                onChange={(e) => setReasonType(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                {predefinedReasons.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        {/* ช่องกรอกเพิ่มเติม */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {reasonType === 'อื่นๆ (Other)' ? 'ระบุสาเหตุ (จำเป็น)*' : 'รายละเอียดเพิ่มเติม (ถ้ามี)'}
                            </label>
                            <textarea 
                                rows="3"
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                placeholder="พิมพ์ข้อความถึงผู้ใช้..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={loading || (reasonType === 'อื่นๆ (Other)' && !customReason.trim())}
                            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {loading ? 'Processing...' : 'Confirm Reject'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Component: ManageReviews (สำหรับจัดการรีวิว) ---
// --- Component: ManageReviews (Updated: Show Location Name + Search) ---
// --- Component: ManageReviews (Updated: Consistent Delete Button) ---
const ManageReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [locationsMap, setLocationsMap] = useState({}); 
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const qReviews = query(collection(db, "reviews"));
        const unsubscribeReviews = onSnapshot(qReviews, (snapshot) => {
            setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const qLocations = query(collection(db, "locations"));
        const unsubscribeLocations = onSnapshot(qLocations, (snapshot) => {
            const locMap = {};
            snapshot.forEach(doc => {
                locMap[doc.id] = doc.data().name; 
            });
            setLocationsMap(locMap);
        });

        return () => {
            unsubscribeReviews();
            unsubscribeLocations();
        };
    }, []);

    const handleDeleteReview = async (reviewId, locationId) => {
        if (!window.confirm("Are you sure you want to delete this review? This will recalculate the location's rating.")) return;

        try {
            await deleteDoc(doc(db, "reviews", reviewId));
            
            // Recalculate Logic
            const q = query(collection(db, "reviews"), where("locationId", "==", locationId));
            const querySnapshot = await getDocs(q);
            const newCount = querySnapshot.size;
            let totalRating = 0;
            querySnapshot.forEach((doc) => { totalRating += doc.data().rating || 0; });
            const newAvg = newCount > 0 ? totalRating / newCount : 0;

            const locationRef = doc(db, "locations", locationId);
            await updateDoc(locationRef, { reviewCount: newCount, avgRating: newAvg });

            toast.success("Review deleted and stats updated!");
        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Failed to delete review.");
        }
    };

    const filteredReviews = reviews.filter(review => {
        const locationName = locationsMap[review.locationId] || ''; 
        return locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (review.userName && review.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return (
        <div className="dark:text-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Manage Reviews</h2>
                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Location or User..."
                        className="w-full pl-10 pr-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            {/* 📱 Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredReviews.map((review) => (
                    <div key={review.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Review for:</p>
                            <p className="font-bold text-blue-600 dark:text-blue-400 truncate text-lg">
                                📍 {locationsMap[review.locationId] || 'Unknown Location'}
                            </p>
                        </div>

                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-white">{review.userName || 'Anonymous'}</p>
                                <p className="text-xs text-gray-500">{review.userEmail}</p>
                            </div>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} className={`h-4 w-4 ${i + 1 <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} filled />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 italic bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600">"{review.text}"</p>
                        
                        {/* ⭐ ปุ่ม Delete บน Mobile (Full Width + Icon) ⭐ */}
                        <button 
                            onClick={() => handleDeleteReview(review.id, review.locationId)} 
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-xl text-sm font-bold border border-red-100 dark:border-red-900/50 transition transform active:scale-95"
                        >
                            <TrashIcon /> Delete Review
                        </button>
                    </div>
                ))}
            </div>

            {/* 💻 Desktop View (Table) */}
            <div className="hidden md:block bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 text-left">
                            <th className="px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                            <th className="px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                            <th className="px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Review</th>
                            <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                            <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredReviews.map((review) => (
                            <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-5 py-4">
                                    <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                                        {locationsMap[review.locationId] || 'Unknown'}
                                    </p>
                                </td>
                                <td className="px-5 py-4">
                                    <p className="text-gray-900 dark:text-white font-bold text-sm">{review.userName}</p>
                                    <p className="text-gray-500 text-xs">{review.userEmail}</p>
                                </td>
                                <td className="px-5 py-4 max-w-xs">
                                    <p className="text-gray-600 dark:text-gray-300 text-sm truncate">{review.text}</p>
                                </td>
                                <td className="px-5 py-4 text-center">
                                    <div className="flex justify-center">
                                         {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} className={`h-4 w-4 ${i + 1 <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} filled />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-center">
                                    {/* ⭐ ปุ่ม Delete บน Desktop (เหมือน Location Table) ⭐ */}
                                    <button 
                                        onClick={() => handleDeleteReview(review.id, review.locationId)} 
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition border border-transparent hover:border-red-200"
                                    >
                                        <TrashIcon /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredReviews.length === 0 && <div className="text-center py-10 text-gray-400">No reviews found.</div>}
            </div>
        </div>
    );
};

// --- Component: ManageReports (Updated: Beautiful Mobile Cards) ---
// --- Component: ManageReports (Updated: Consistent Delete Button) ---
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
        toast.success(`Status updated to ${newStatus}`);
    };

    const handleDelete = async (reportId) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            await deleteDoc(doc(db, "reports", reportId));
            toast.success("Report deleted");
        }
    };

    return (
        <div className="dark:text-gray-200">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-5">Manage Reports</h2>

            {/* 📱 Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {reports.map(report => (
                    <div key={report.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${report.status === 'resolved' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>

                        {/* Header */}
                        <div className="flex justify-between items-start mb-3 pl-2">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white leading-tight">
                                    {report.locationName}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    {report.createdAt?.toDate().toLocaleString()}
                                </p>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                                report.status === 'resolved' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                                {report.status}
                            </span>
                        </div>

                        {/* Body */}
                        <div className="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl mb-4 ml-2 border border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                                "{report.reportText}"
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-3 pl-2">
                            <div className="text-xs text-gray-400 w-full sm:w-auto">
                                <span className="font-semibold text-gray-500 dark:text-gray-400">By:</span> {report.userEmail}
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                {/* Dropdown */}
                                <div className="relative flex-1 sm:flex-none">
                                    <select 
                                        value={report.status} 
                                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                        className="w-full appearance-none bg-gray-100 dark:bg-gray-700 border-none text-gray-700 dark:text-gray-200 text-sm font-medium py-2 pl-3 pr-8 rounded-xl cursor-pointer focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="pending">⏳ Pending</option>
                                        <option value="resolved">✅ Resolved</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>

                                {/* ⭐ ปุ่ม Delete บน Mobile (Square Icon Style) ⭐ */}
                                <button 
                                    onClick={() => handleDelete(report.id)} 
                                    className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-xl transition shadow-sm flex-shrink-0"
                                    title="Delete Report"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {reports.length === 0 && (
                    <div className="text-center py-10 text-gray-400">No reports found 🎉</div>
                )}
            </div>

            {/* 💻 Desktop View (Table) */}
            <div className="hidden md:block bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 text-left">
                            <th className="px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location Name</th>
                            <th className="px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                            <th className="px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">By</th>
                            <th className="px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {reports.map(report => (
                            <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">{report.locationName}</td>
                                <td className="px-5 py-4 text-sm max-w-xs break-words text-gray-600 dark:text-gray-300">{report.reportText}</td>
                                <td className="px-5 py-4 text-sm text-gray-500">{report.userEmail}</td>
                                <td className="px-5 py-4 text-sm text-gray-500">{report.createdAt?.toDate().toLocaleString()}</td>
                                <td className="px-5 py-4 text-sm text-center">
                                    <select
                                        value={report.status} onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                        className={`py-1 px-2 rounded-lg text-xs font-bold border-none cursor-pointer outline-none shadow-sm ${report.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'}`}
                                    >
                                        <option value="pending">Pending</option> <option value="resolved">Resolved</option>
                                    </select>
                                </td>
                                <td className="px-5 py-4 text-sm text-center">
                                    {/* ⭐ ปุ่ม Delete บน Desktop (Table Style) ⭐ */}
                                    <button 
                                        onClick={() => handleDelete(report.id)} 
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition border border-transparent hover:border-red-200"
                                    >
                                        <TrashIcon /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reports.length === 0 && <div className="text-center py-10 text-gray-400">No reports found.</div>}
            </div>
        </div>
    );
};

// --- ⭐ Location Map View (Updated: มีปุ่ม Approve/Reject) ⭐ ---
// --- ⭐ Location Map View (Updated: Mobile Responsive Layout) ⭐ ---
// --- ⭐ Location Map View (Updated: Show ALL Context Pins) ⭐ ---
// --- ⭐ Location Map View (Updated: High Contrast Context Pins) ⭐ ---
// --- ⭐ Location Map View (Updated: Theme Colors - Blue & Red) ⭐ ---
// --- ⭐ Location Map View (Updated: Make Context Pins POP with Pin Shape) ⭐ ---
// --- ⭐ Location Map View (Updated: Interactive Pins & Red Target) ⭐ ---
// --- ⭐ Location Map View (Updated: Fix Duplicate Markers & Clean Cleanup) ⭐ ---
const LocationMapView = ({ location, onBack, onApprove, onReject, onSelectLocation }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const isLoaded = window.google && window.google.maps;
    const [existingLocations, setExistingLocations] = useState([]);
    
    // ⭐ เพิ่ม Ref สำหรับเก็บหมุดทั้งหมด เพื่อใช้ลบก่อนวาดใหม่
    const markersRef = useRef([]); 
    const infoWindowRef = useRef(null);

    // 1. ดึงข้อมูลหมุดบริบท
    useEffect(() => {
        const fetchExistingLocations = async () => {
            try {
                const q = query(collection(db, "locations")); 
                const querySnapshot = await getDocs(q);
                const locs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setExistingLocations(locs);
            } catch (error) { console.error("Error fetching context:", error); }
        };
        fetchExistingLocations();
    }, []);

    // 2. วาดแผนที่ และจัดการหมุด
    useEffect(() => {
        if (isLoaded && mapRef.current) {
            // --- A. สร้าง Map Instance (ทำแค่ครั้งเดียว) ---
            if (!mapInstanceRef.current) {
                mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                    center: { lat: location.lat, lng: location.lng },
                    zoom: 16,
                    disableDefaultUI: true,
                    gestureHandling: 'greedy',
                });
                
                infoWindowRef.current = new window.google.maps.InfoWindow({
                    maxWidth: 250,
                    disableAutoPan: true
                });
            } else {
                // ถ้ามี Map อยู่แล้ว ให้เลื่อนไปหาเป้าหมายใหม่
                mapInstanceRef.current.panTo({ lat: location.lat, lng: location.lng });
            }

            const map = mapInstanceRef.current;
            const pinPath = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

            // --- ⭐ B. ล้างหมุดเก่าทั้งหมดก่อนวาดใหม่ (แก้ปัญหาหมุดซ้อน) ⭐ ---
            if (markersRef.current.length > 0) {
                markersRef.current.forEach(marker => marker.setMap(null));
                markersRef.current = []; // เคลียร์ Array
            }

            // --- C. วาดหมุดบริบท (Context Pins) ---
            existingLocations.forEach(loc => {
                // ⚠️ เช็กให้ชัวร์ว่าไม่วาดทับหมุดเป้าหมาย (ใช้ ID เทียบ)
                if (loc.id === location.id) return; 

                const isApproved = loc.status === 'approved';
                const fillColor = isApproved ? "#3B82F6" : "#EAB308"; 

                const marker = new window.google.maps.Marker({
                    position: { lat: loc.lat, lng: loc.lng },
                    map: map,
                    icon: { 
                        path: pinPath, 
                        scale: 1.8, 
                        fillColor: fillColor, 
                        fillOpacity: 1, 
                        strokeWeight: 1.5, 
                        strokeColor: "#FFFFFF",
                        anchor: new window.google.maps.Point(12, 24)
                    },
                    zIndex: 1 
                });

                // Interaction: Hover
                marker.addListener("mouseover", () => {
                    const contentString = `
                        <div style="padding: 0px; text-align: center;">
                            <div style="width: 100%; height: 80px; background-image: url('${loc.imageUrl || 'https://placehold.co/150'}'); background-size: cover; background-position: center; border-radius: 8px 8px 0 0;"></div>
                            <div style="padding: 8px;">
                                <h3 style="margin: 0; font-size: 14px; font-weight: bold; color: #333;">${loc.name}</h3>
                                <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background-color: ${isApproved ? '#dbeafe' : '#fef9c3'}; color: ${isApproved ? '#1e40af' : '#854d0e'}; margin-top: 4px; display: inline-block;">
                                    ${isApproved ? '✅ Active' : '⏳ Pending'}
                                </span>
                                <p style="margin: 4px 0 0; font-size: 10px; color: #666;">Click to select</p>
                            </div>
                        </div>
                    `;
                    infoWindowRef.current.setContent(contentString);
                    infoWindowRef.current.open(map, marker);
                });

                // Interaction: Click -> เปลี่ยนเป้าหมาย
                marker.addListener("click", () => {
                    if (onSelectLocation) {
                        onSelectLocation(loc); // ส่งค่ากลับไปให้ AdminDashboard สลับหน้า
                    }
                });

                // เก็บเข้า Array เพื่อรอลบ
                markersRef.current.push(marker);
            });

            // --- 🎯 D. วาดหมุดเป้าหมาย (Target Pin) ---
            const targetMarker = new window.google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: map,
                title: `Target: ${location.name}`,
                icon: {
                    path: pinPath,
                    fillColor: "#EF4444", // สีแดงเสมอ
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#FFFFFF",
                    scale: 2.5, 
                    anchor: new window.google.maps.Point(12, 24),
                },
                animation: window.google.maps.Animation.BOUNCE,
                zIndex: 999
            });

            // เก็บหมุดเป้าหมายเข้า Array ด้วย (จะได้ลบได้เมื่อเปลี่ยนหน้า)
            markersRef.current.push(targetMarker);
        }
    }, [isLoaded, location, existingLocations]);

    // --- ส่วน Render HTML ---
    return (
        <div className="dark:text-gray-200 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 shrink-0 gap-3">
                <div className="w-full md:w-auto">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 flex-wrap">
                        <span className="break-words">📍 {location.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${
                            location.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                            : 'bg-green-100 text-green-700 border-green-200'
                        }`}>
                            {location.status === 'pending' ? 'Waiting Approval' : 'Active'}
                        </span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">By: {location.userEmail || 'Unknown'}</p>
                </div>
                
                <button onClick={onBack} className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2">
                    <BackIcon /> Back
                </button>
            </div>

            <div className="flex-1 relative rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 min-h-[300px]">
                {!isLoaded && <div className="absolute inset-0 flex items-center justify-center bg-gray-100">Loading Map...</div>}
                <div ref={mapRef} className="w-full h-full" />
                
                {location.status === 'pending' && (
                    <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 flex flex-col md:flex-row gap-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-white/20">
                        <button 
                            onClick={() => onReject(location)} 
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 md:py-2.5 px-6 rounded-xl shadow-md transition transform active:scale-95"
                        >
                            <TrashIcon /> Reject
                        </button>
                        <button 
                            onClick={() => onApprove(location)} 
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 md:py-2.5 px-6 rounded-xl shadow-md transition transform active:scale-95"
                        >
                            <CheckCircleIcon /> Approve
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- ⭐ Admin Dashboard (Updated: Fix Back Navigation & Alerts) ⭐ ---
// --- ⭐ Admin Dashboard (Logic Center) ⭐ ---
function AdminDashboard() {
    // เพิ่มบรรทัดนี้ใน AdminDashboard (ใต้ const [locationFilter...])
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [locationToReject, setLocationToReject] = useState(null);
    const [view, setView] = useState('users'); 
    const [viewingLocation, setViewingLocation] = useState(null);
    
    // ⭐ เก็บ State ของ Tab Location ไว้ที่นี่ (ค่าจะไม่หายตอนเปลี่ยน View)
    const [locationFilter, setLocationFilter] = useState('pending');


    const handleSignOut = async () => {
        try { await signOut(auth); } catch (error) { console.error("Sign out error: ", error); }
    };

    // --- Logic อนุมัติ (รวมศูนย์ที่นี่) ---
    const handleApproveLocation = async (location) => {
        // ✅ Popup ยืนยันการอนุมัติ (ถ้าต้องการ)
        if (!window.confirm(`ยืนยันการอนุมัติ "${location.name}"?`)) return;
        
        try {
            const locRef = doc(db, "locations", location.id);
            await updateDoc(locRef, { status: 'approved' });

            if (location.submittedBy && location.submittedBy !== auth.currentUser.uid) {
                await addDoc(collection(db, "users", location.submittedBy, "notifications"), {
                    type: 'approved', locationName: location.name, message: "Your location has been approved and is now visible!", createdAt: serverTimestamp(), read: false
                });
            }

            toast.success(`อนุมัติ "${location.name}" เรียบร้อย!`);
            confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
            
            // ปิด Map (ถ้าเปิดอยู่) กลับไปหน้า List
            setViewingLocation(null);

        } catch (error) {
            console.error("Error approving:", error);
            toast.error("ไม่สามารถอนุมัติได้");
        }
    };

    // --- Logic ลบ/ปฏิเสธ (รวมศูนย์ที่นี่) ---
    // --- Logic ลบ/ปฏิเสธ (รวมศูนย์ที่นี่) ---
    // --- 1. ฟังก์ชันเปิด Modal (ใช้แทน handleDeleteLocation เดิมตอนกดปุ่ม) ---
    const openRejectModal = (location) => {
        setLocationToReject(location);
        setIsRejectModalOpen(true);
    };

    // --- 2. Logic การลบ/ปฏิเสธ ของจริง (ทำงานเมื่อกด Confirm ใน Modal) ---
    // ฟังก์ชันนี้จะรับ 'reason' มาจาก Modal ครับ
    const executeReject = async (location, reason) => {
        const isPending = location.status === 'pending';
        
        try {
            // 1. ลบรูปภาพ (ถ้ามี)
            if (location.imageUrl) {
                try { await deleteObject(storageRef(storage, location.imageUrl)); } catch (err) {}
            }
            
            // 2. ลบเอกสารจาก Firestore
            await deleteDoc(doc(db, "locations", location.id));

            // 3. ส่ง Notification พร้อมเหตุผล
            if (location.submittedBy) {
                
                // กำหนดประเภทและข้อความหัวเรื่อง
                let notiType = 'rejected';
                let headerMsg = `Your location "${location.name}" was rejected by admin.`;

                // ถ้าไม่ใช่ Pending (คือลบหมุดที่อนุมัติแล้ว)
                if (!isPending) {
                    notiType = 'deleted';
                    headerMsg = `Your location "${location.name}" has been removed by admin.`;
                }

                // ⚠️ บันทึกลง Firestore พร้อม reason
                await addDoc(collection(db, "users", location.submittedBy, "notifications"), {
                    type: notiType,
                    locationName: location.name,
                    message: headerMsg, 
                    reason: reason, // ⭐ บันทึกเหตุผลลงไปตรงนี้
                    createdAt: serverTimestamp(),
                    read: false
                });
            }

            toast.success(isPending ? "ปฏิเสธคำขอเรียบร้อย" : "ลบสถานที่เรียบร้อย");
            
            // Reset ค่าต่างๆ
            setViewingLocation(null); // ปิด Map
            setIsRejectModalOpen(false); // ปิด Modal
            setLocationToReject(null);

        } catch (error) {
            console.error("Error deleting:", error);
            toast.error("เกิดข้อผิดพลาด");
            setIsRejectModalOpen(false); // กันเหนียว ปิด Modal ไว้ก่อนถ้า Error
        }
    };

    const renderView = () => {
        if (viewingLocation) {
            return (
                <LocationMapView 
                    location={viewingLocation} 
                    onBack={() => setViewingLocation(null)} // กลับไปหน้า List (State Tab ยังอยู่)
                    onApprove={handleApproveLocation}
                    onReject={openRejectModal}
                    onSelectLocation={setViewingLocation}
                />
            );
        }
        switch (view) {
            case 'users': return <ManageUsers />;
            case 'locations': 
                return (
                    <ManageLocations 
                        onViewLocation={setViewingLocation}
                        // ส่ง State และ Function ลงไป
                        currentFilter={locationFilter}
                        setFilter={setLocationFilter}
                        onApprove={handleApproveLocation}
                        onDelete={openRejectModal}
                    />
                );
            case 'reports': return <ManageReports />;
            case 'reviews': return <ManageReviews />;
            default: return <ManageUsers />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-900">
            <Toaster position="top-right" reverseOrder={false} />
            <div className="w-full md:w-64 bg-gray-800 dark:bg-gray-950 text-white p-5 flex flex-col flex-shrink-0">
                <div className="flex justify-between items-center md:block">
                    <h1 className="text-2xl font-bold mb-0 md:mb-10">Admin Panel</h1>
                </div>
                <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 mt-4 md:mt-0 overflow-x-auto pb-2 md:pb-0">
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('users'); setViewingLocation(null);}} className={`p-2 rounded whitespace-nowrap ${view === 'users' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Users</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('locations'); setViewingLocation(null);}} className={`p-2 rounded whitespace-nowrap ${view === 'locations' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Locations</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('reports'); setViewingLocation(null);}} className={`p-2 rounded whitespace-nowrap ${view === 'reports' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Reports</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('reviews'); setViewingLocation(null);}} className={`p-2 rounded whitespace-nowrap ${view === 'reviews' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Reviews</a>
                </nav>
                <button onClick={handleSignOut} className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded hidden md:block">Sign Out</button>
            </div>
            <div className="flex-1 p-4 md:p-10 overflow-y-auto">
                {renderView()}
            </div>
            {/* 👇👇 วาง RejectModal ไว้ตรงนี้ (ก่อนปิด div หลักของ Dashboard) 👇👇 */}
            {isRejectModalOpen && locationToReject && (
                <RejectModal 
                    location={locationToReject} 
                    onClose={() => setIsRejectModalOpen(false)} 
                    onConfirm={executeReject} 
                />
            )}
        </div>
    );
}
// ... (LocationFormModal - No changes needed) ...
// ... (LocationFormModal ตัวใหม่) ...
// ... (วางทับ LocationFormModal ตัวเดิม) ...
// ... (วางทับ LocationFormModal ตัวเดิมทั้งหมด) ...

// --- Location Form Modal (Updated with Skeleton on Upload) ---
// --- Location Form Modal (Updated: Use Toast for Alerts) ---
const LocationFormModal = ({ currentLocation, onClose, initialCoords, onSuccess, setView }) => {
    const [name, setName] = useState(currentLocation?.name || '');
    const [lat, setLat] = useState(currentLocation?.lat || initialCoords?.lat || '');
    const [lng, setLng] = useState(currentLocation?.lng || initialCoords?.lng || '');
    const [type, setType] = useState(currentLocation?.type || 'motorcycle');
    const [routes, setRoutes] = useState(currentLocation?.routes || [{ destination: '', price: '' }]);
    
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(currentLocation?.imageUrl || null);

    const [uploading, setUploading] = useState(false);
    // const [error, setError] = useState(''); // ❌ ไม่ใช้ State error แล้ว ใช้ toast แทน

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
        // setError(''); // ไม่ต้องใช้แล้ว

        // --- ⭐ ใช้ toast.error แจ้งเตือนแบบน่ารักๆ ⭐ ---
        if (!name || name.trim() === '') {
            toast.error("กรุณาใส่ชื่อสถานที่ (Pin Name) ด้วยนะครับ 🥺");
            return;
        }
        if (!imageFile && !currentLocation?.imageUrl) {
            toast.error("อย่าลืมอัปโหลดรูปภาพสถานที่นะ 📸"); 
            return;
        }
        if (!auth.currentUser) {
            toast.error("ต้องเข้าสู่ระบบก่อนนะ ถึงจะปักหมุดได้ 🔒"); 
            return;
        }
        // ------------------------------------------------

        setUploading(true);
        let imageUrl = currentLocation?.imageUrl || '';

        try {
            // Upload Image
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

            // Prepare Data
            const locationData = {
                name, lat: Number(lat), lng: Number(lng), type, routes, imageUrl,
                status: currentLocation?.status || 'pending',
                submittedBy: currentLocation?.submittedBy || auth.currentUser.uid,
                createdAt: currentLocation?.createdAt || serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Save to Firestore
            if (currentLocation) {
                await setDoc(doc(db, "locations", currentLocation.id), locationData, { merge: true });
                toast.success("แก้ไขข้อมูลเรียบร้อย! 🎉"); // แจ้งเตือนสำเร็จ
            } else {
                await addDoc(collection(db, "locations"), locationData);
                toast.success("ส่งข้อมูลเรียบร้อย! รอแอดมินอนุมัตินะ 🚀"); // แจ้งเตือนสำเร็จ
            }

            // --- 🎉🎉 จุดพลุฉลองตรงนี้เลยครับ 🎉🎉 ---
            confetti({
                particleCount: 150,   // จำนวนชิ้นพลุ
                spread: 70,           // การกระจายตัว
                origin: { y: 0.6 },   // จุดที่พุ่งออกมา (0.6 คือค่อนไปทางล่างหน่อย)
                colors: ['#2563eb', '#9333ea', '#ffffff'], // สีฟ้า, ม่วง, ขาว (ธีมอวกาศของเรา)
                zIndex: 9999          // ให้ลอยทับ Modal
            });
            // ---------------------------------------
            
            onSuccess(); // ปิด Modal

            // Logic เปลี่ยนหน้า
            if (!currentLocation && setView) {
                setView('waiting');
            }
        } catch (err) {
            console.error("Error submitting location:", err); 
            toast.error("เกิดข้อผิดพลาด: " + err.message); // แจ้งเตือน Error
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the details to share this spot.</p>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                    
                    {/* ❌ ลบกล่อง Error สีแดงเดิมออก เพราะเราใช้ Toast แล้ว */}
                    {/* {error && (...)} */}

                    {/* Image Upload with Skeleton Overlay */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location Image</label>
                        <div className="relative group h-48 w-full">
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" disabled={uploading}/>
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
                            {uploading && (
                                <div className="absolute inset-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                                    <div className="w-full h-full p-4">
                                        <Skeleton className="w-full h-full rounded-xl" />
                                        <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300 font-bold animate-pulse">Uploading...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pin Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white" required />
                        </div>
                        {/* Latitude */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Latitude</label>
                            <input 
                                type="number" 
                                step="any" // 👈 สำคัญ! เพื่อให้ใส่ทศนิยมละเอียดๆ ได้
                                value={lat} 
                                onChange={(e) => setLat(e.target.value)} // 👈 เพิ่มอันนี้ให้พิมพ์ค่าได้
                                placeholder="13.xxxxxx"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white transition-all" 
                            />
                        </div>

                        {/* Longitude */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Longitude</label>
                            <input 
                                type="number" 
                                step="any" // 👈 สำคัญ!
                                value={lng} 
                                onChange={(e) => setLng(e.target.value)} // 👈 เพิ่มอันนี้ให้พิมพ์ค่าได้
                                placeholder="100.xxxxxx"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white transition-all" 
                            />
                        </div>
                        {/* Vehicle Type (ปรับปรุงใหม่: มีลูกศร Dropdown) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Vehicle Type</label>
                            
                            <div className="relative">
                                {/* ตัว Dropdown */}
                                <select 
                                    value={type} 
                                    onChange={e => setType(e.target.value)} 
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white appearance-none cursor-pointer transition-shadow hover:shadow-sm"
                                >
                                    <option value="motorcycle">🛵 Win Motorbike (วินมอเตอร์ไซค์)</option>
                                    <option value="songthaew">🚌 Songthaew (รถสองแถว)</option>
                                </select>

                                {/* ⭐⭐ ไอคอนลูกศรชี้ลง (วางทับด้านขวา) ⭐⭐ */}
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 dark:text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Places & Prices */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200  tracking-wider">Destinations & Prices</h4>
                            <button type="button" onClick={addRoute} className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center"><span className="mr-1"><PlusIcon /></span> Add Route</button>
                        </div>
                        <div className="space-y-4">
                            {routes.map((route, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-3 sm:items-end animate-fadeIn bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                                    <div className="flex-1 w-full">
                                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block sm:hidden ml-1">Destination</label>
                                        <input type="text" placeholder="Destination (e.g. BTS Station)" value={route.destination} onChange={e => handleRouteChange(index, 'destination', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition" />
                                    </div>
                                    <div className="flex items-end gap-3 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:w-40">
                                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block sm:hidden ml-1">Price</label>
                                            <input type="number" placeholder="Price" value={route.price} onChange={e => handleRouteChange(index, 'price', e.target.value)} className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition" />
                                            <span className="absolute right-3 bottom-2.5 text-gray-400 text-xs font-bold">฿</span>
                                        </div>
                                        {routes.length > 1 && (
                                            <button type="button" onClick={() => removeRoute(index)} className="p-2.5 mb-[1px] text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition flex-shrink-0" title="Remove route"><TrashIcon /></button>
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
                    <button type="button" onClick={handleSubmit} disabled={uploading} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 disabled:bg-blue-400 disabled:cursor-not-allowed transition transform active:scale-95 flex items-center">
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
        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {notifications.map((noti) => (
            <div key={noti.id} className={`p-4 rounded-xl border-l-4 shadow-sm relative overflow-hidden ${
              noti.type === 'approved' 
                ? 'bg-green-50 border-green-500 dark:bg-green-900/20' 
                : 'bg-red-50 border-red-500 dark:bg-red-900/20'
            }`}>
              
              {/* Header */}
              <h4 className={`font-bold text-lg mb-1 ${noti.type === 'approved' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {noti.type === 'approved' ? '✅ Approved' : noti.type === 'deleted' ? '🗑️ Deleted' : '❌ Rejected'}
              </h4>
              
              {/* ชื่อสถานที่ */}
              <p className="text-gray-800 dark:text-gray-200 text-sm font-semibold mb-1">
                 📍 {noti.locationName}
              </p>
              
              {/* ข้อความหลัก */}
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                  {noti.message}
              </p>

              {/* ⭐⭐ ส่วนแสดงเหตุผล (Reason) ⭐⭐ */}
              {noti.reason && (
                  <div className="mt-2 p-2 bg-white/60 dark:bg-black/20 rounded-lg text-xs border border-gray-200 dark:border-gray-700">
                      <span className="font-bold text-gray-700 dark:text-gray-300">Reason: </span>
                      <span className="text-gray-600 dark:text-gray-400">{noti.reason}</span>
                  </div>
              )}

            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-95">
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
// --- ⭐ Profile Modal (Space ID Card Style) ⭐ ---
const ProfileModal = ({ user, onClose }) => {
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (displayName.trim() === '') return toast.error("ชื่อห้ามว่างนะ!");
        setLoading(true);
        try {
            await updateProfile(auth.currentUser, { displayName: displayName.trim() });
            await updateDoc(doc(db, "users", user.uid), { displayName: displayName.trim() });
            toast.success("อัปเดตโปรไฟล์เรียบร้อย! 🚀");
            setTimeout(onClose, 1000);
        } catch (err) { toast.error("เกิดข้อผิดพลาด"); } 
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={onClose}>
            
            {/* Card Container */}
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                
                {/* 🌌 Space Background (ส่วนหัว) */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900">
                    {/* Stars & Blobs (CSS เดิม) */}
                    <div className="absolute inset-0 opacity-50">
                        <div className="absolute top-[-50%] left-[-20%] w-60 h-60 bg-blue-500 rounded-full blur-[60px]"></div>
                        <div className="absolute bottom-[-20%] right-[-20%] w-40 h-40 bg-pink-500 rounded-full blur-[50px]"></div>
                    </div>
                </div>

                {/* Content (ส่วนเนื้อหา - สีขาว/ดำ) */}
                <div className="relative bg-white dark:bg-gray-900 pt-16 pb-6 px-6 mt-20">
                    
                    {/* Avatar (รูปวงกลมลอยทับส่วนหัว) */}
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                        <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-900 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-4xl font-bold text-white">
                                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Profile</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Display Name</label>
                            <input 
                                type="text" 
                                value={displayName} 
                                onChange={(e) => setDisplayName(e.target.value)} 
                                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 outline-none text-gray-800 dark:text-white font-medium transition-all"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
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

    const [userPosition, setUserPosition] = useState(null); // เก็บพิกัดจริงของ User

    const [showTooCloseAlert, setShowTooCloseAlert] = useState(false);

    const [showManualInput, setShowManualInput] = useState(false);
    const [manualLat, setManualLat] = useState('');
    const [manualLng, setManualLng] = useState('');

    // ... state เดิม
    const [isMyPinsModalOpen, setIsMyPinsModalOpen] = useState(false); // ⭐ State ใหม่
    // --- ⭐ ฟังก์ชันเปิดหมุดจากรายการ My Pins ⭐ ---

    const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false); // ⭐ State สำหรับเปิด Favorites

    // 🟢 2.2 วางฟังก์ชัน ไว้ตรงนี้ (ก่อนถึง return)
    // ---------------------------------------------------------
    const handleSelectMyPin = (location) => {
        setIsMyPinsModalOpen(false);
        setMenuOpen(false);
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: location.lat, lng: location.lng });
            mapInstanceRef.current.setZoom(17);
        }
        setSelectedLocation(location);
    };
    // ---------------------------------------------------------
    useEffect(() => { setLocalSelectedLocation(selectedLocation); }, [selectedLocation]);
    const handleSignOut = async () => { try { await signOut(auth); } catch (error) { console.error("Sign out error: ", error); } };
    useEffect(() => { if (!user) { setUserLikes(new Set()); return; } const likesRef = collection(db, "users", user.uid, "likes"); const unsubscribe = onSnapshot(likesRef, (snapshot) => { setUserLikes(new Set(snapshot.docs.map(doc => doc.id))); }); return () => unsubscribe(); }, [user]);
    const handleLike = async (location) => { if (!user) { 
            toast.error("กรุณาเข้าสู่ระบบเพื่อกดถูกใจ ", {
                style: {
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    color: '#000',
                },
            });
            return; 
        } if (!location || !location.id) return; const locationId = location.id; const locationRef = doc(db, "locations", locationId); const likeRef = doc(db, "users", user.uid, "likes", locationId); const isLiked = userLikes.has(locationId); const newLikes = new Set(userLikes); const currentCount = localSelectedLocation?.likeCount || locations.find(l => l.id === locationId)?.likeCount || 0; let updatedCount; if (isLiked) { newLikes.delete(locationId); updatedCount = currentCount - 1; } else { newLikes.add(locationId); updatedCount = currentCount + 1; } setLocalSelectedLocation(prev => prev ? { ...prev, likeCount: updatedCount < 0 ? 0 : updatedCount } : null); setUserLikes(newLikes); try { if (isLiked) { await deleteDoc(likeRef); await updateDoc(locationRef, { likeCount: increment(-1) }); } else { await setDoc(likeRef, { createdAt: serverTimestamp() }); await updateDoc(locationRef, { likeCount: increment(1) }); } } catch (error) { console.error("Like error:", error); setUserLikes(userLikes); setLocalSelectedLocation(location); alert("Failed to update like."); } };

// --- ⭐ ฟังก์ชันแชร์สถานที่ ⭐ ---
    // --- แก้ไข handleShare ---
    const handleShare = async () => {
        if (!localSelectedLocation) return;

        // 1. สร้าง URL พร้อมแนบ ID หมุดไปด้วย (?pin=...)
        const shareUrl = new URL(window.location.origin);
        shareUrl.searchParams.set('pin', localSelectedLocation.id);
        const finalUrl = shareUrl.toString();

        const shareData = {
            title: localSelectedLocation.name,
            text: `มาดูจุดจอดรถ "${localSelectedLocation.name}" ในแอป EasyWay กันเถอะ!`,
            url: finalUrl // ใช้ URL แบบมี ID
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(finalUrl);
            toast.success("คัดลอกลิงก์เรียบร้อย! 📋");
        }
    };
    // -----------------------------

    // ฟังก์ชันสร้างรูปหมุด SVG ตามสีที่กำหนด
    const getMarkerIcon = (color) => {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="${color}">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
        </svg>`;
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    };

    const getDistanceText = (targetLat, targetLng) => {
        if (!userPosition || !window.google?.maps?.geometry) return null;

        const userLatLng = new window.google.maps.LatLng(userPosition.lat, userPosition.lng);
        const targetLatLng = new window.google.maps.LatLng(targetLat, targetLng);
        const distanceMeters = window.google.maps.geometry.spherical.computeDistanceBetween(userLatLng, targetLatLng);

        if (distanceMeters < 1000) {
            return `${Math.round(distanceMeters)} ม.`; // แสดงเป็นเมตร
        } else {
            return `${(distanceMeters / 1000).toFixed(1)} กม.`; // แสดงเป็นกิโลเมตร
        }
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

    // --- ⭐ เพิ่ม useEffect นี้ใน MapScreen ⭐ ---
    // ทำหน้าที่: ถ้าเปิดเว็บมาด้วยลิงก์แชร์ ให้เปิด Modal หมุดนั้นอัตโนมัติ
    useEffect(() => {
        // ต้องรอให้โหลด locations เสร็จก่อน ถึงจะหาหมุดเจอ
        if (locations.length > 0) {
            const searchParams = new URLSearchParams(window.location.search);
            const pinId = searchParams.get('pin'); // ดูว่ามี ?pin=... ไหม

            if (pinId) {
                const foundLocation = locations.find(loc => loc.id === pinId);
                if (foundLocation) {
                    setSelectedLocation(foundLocation); // เปิด Modal ทันที
                    
                    // (แถม) เลื่อนแผนที่ไปหาหมุดนั้นด้วย
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.setCenter({ 
                            lat: foundLocation.lat, 
                            lng: foundLocation.lng 
                        });
                        mapInstanceRef.current.setZoom(16);
                    }
                    
                    // เคลียร์ URL ให้สวยงาม (ลบ ?pin=... ออก) เพื่อไม่ให้กวนใจ
                    window.history.replaceState({}, '', window.location.pathname);
                }
            }
        }
    }, [locations, isLoaded]); // ทำงานเมื่อ locations โหลดมาครบแล้ว

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
    const moveToCurrentLocation = () => { 
        if (navigator.geolocation) { 
            navigator.geolocation.getCurrentPosition((pos) => { 
                const { latitude, longitude } = pos.coords; 
                const current = { lat: latitude, lng: longitude }; 
                
                // ⭐ บันทึกพิกัดลง State
                setUserPosition(current); 
                
                if (!mapInstanceRef.current) return; 
                mapInstanceRef.current.setCenter(current); 
                mapInstanceRef.current.setZoom(16); 
                
                // (โค้ดวาด User Marker เดิม...) 
                if (userMarkerRef.current) userMarkerRef.current.setMap(null); 
                userMarkerRef.current = new window.google.maps.Marker({ 
                    position: current, 
                    map: mapInstanceRef.current, 
                    title: "Your Location", 
                    icon: { 
                        path: window.google.maps.SymbolPath.CIRCLE, 
                        scale: 8, 
                        fillColor: "#4285F4", 
                        fillOpacity: 1, 
                        strokeColor: "white", 
                        strokeWeight: 2 
                    }, 
                }); 
            }, 
            (error) => toast.error("ไม่สามารถระบุตำแหน่งได้"), 
            { enableHighAccuracy: true }
            ); 
        } else { 
            toast.error("Geolocation not supported."); 
        } 
    };
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

    // --- ⭐ ฟังก์ชันรับค่าพิกัดที่กรอกเอง ⭐ ---
    const handleManualSubmit = () => {
        const lat = parseFloat(manualLat);
        const lng = parseFloat(manualLng);

        // เช็กว่ากรอกตัวเลขถูกไหม
        if (isNaN(lat) || isNaN(lng)) {
            toast.error("กรุณากรอกพิกัดเป็นตัวเลขให้ถูกต้อง");
            return;
        }

        const coords = { lat, lng };
        
        // เช็กระยะห่าง (Optional: ถ้าอยากใช้กฎเดิม)
        if (isTooCloseToExistingMarker(lat, lng)) {
            setShowTooCloseAlert(true);
            return;
        }

        setTempPin(coords); // บันทึกพิกัดชั่วคราว
        
        // เลื่อนแผนที่ไปจุดนั้น
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(coords);
            mapInstanceRef.current.setZoom(18);
        }

        // เปิด Modal กรอกข้อมูลทันที (เหมือนกด Confirm)
        setIsAddLocationModalOpen(true);
        setPinningMode(false);
        setShowManualInput(false);
        
        // ล้างค่า
        setManualLat('');
        setManualLng('');
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
            <Toaster position="top-right" reverseOrder={false} />
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
                                    referrerPolicy="no-referrer" // 👈 ⭐ เติมบรรทัดนี้เข้าไปครับ
                                    onClick={() => openImageModal(localSelectedLocation.imageUrl)}
                                />
                                {/* --- ⭐ ปุ่ม Report (ปรับปรุงใหม่: สีแดง + มีข้อความ) ⭐ --- */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }} 
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { if (user) { setIsReportModalOpen(true) } else { toast.error('กรุณาเข้าสู่ระบบเพื่อรายงาน') } }}
                                    // เปลี่ยน Style ตรงนี้ครับ 👇
                                    className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-red-600/90 hover:bg-red-700 text-white px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm transition-all border border-red-400/30"
                                >
                                    {/* ลดขนาดไอคอนลงนิดนึง เพื่อความสมดุล */}
                                    <div className="w-4 h-4">
                                        <FlagIcon />
                                    </div>
                                    {/* เพิ่มข้อความบอกชัดเจน */}
                                    <span className="text-xs font-bold tracking-wide">Report</span>
                                </motion.button>
                                {/* ------------------------------------------------------- */}
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
                            {/* เนื้อหา Modal (ปรับแก้: ระยะทางอยู่ข้างประเภทรถ) */}
                            <div className="p-5 space-y-4">
                                <div>
                                    {/* ชื่อสถานที่ */}
                                    <h3 className="text-2xl font-bold dark:text-white leading-tight mb-2">{localSelectedLocation.name}</h3>
                                    
                                    {/* ส่วนแสดงรายละเอียด (จัดกลุ่มใหม่) */}
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                                        
                                        {/* กลุ่ม A: ดาวรีวิว */}
                                        <div className="flex items-center">
                                            <StarRatingDisplay rating={localSelectedLocation.avgRating} count={localSelectedLocation.reviewCount} />
                                        </div>

                                        {/* เส้นคั่น (ซ่อนในมือถือจอเล็กมากๆ) */}
                                        <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>

                                        {/* กลุ่ม B: ประเภทรถ + ระยะทาง (อยู่ด้วยกัน) */}
                                        <div className="flex items-center gap-2">
                                            {/* ประเภทรถ */}
                                            <span className="capitalize font-medium text-gray-700 dark:text-gray-300">
                                                {localSelectedLocation.type}
                                            </span>

                                            {/* ระยะทาง (แสดงเมื่อมีพิกัด) */}
                                            {userPosition && (
                                                <>
                                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                                    <span className="flex items-center font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-md whitespace-nowrap">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                        </svg>
                                                        {getDistanceText(localSelectedLocation.lat, localSelectedLocation.lng)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ... (ปุ่มนำทาง และ Action Buttons ด้านล่าง ปล่อยไว้เหมือนเดิม) ... */}
                                <motion.a
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
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

                                <AnimatePresence>
                                    {showPrices && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 max-h-40 overflow-y-auto"
                                        >
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

                                {/* Action Buttons */}
                                {/* Action Buttons ด้านล่าง (เรียงใหม่: Like -> Review -> Price -> Share) */}
                                {/* --- ส่วนปุ่มกด (Action Buttons) --- */}
                                {/* เงื่อนไข: ถ้าสถานะเป็น 'pending' (รออนุมัติ) ให้โชว์ป้ายเตือนแทนปุ่ม */}
                                {localSelectedLocation.status === 'pending' ? (
                                    
                                    // 🔒 ส่วนแสดงผลสำหรับหมุดที่รออนุมัติ (ทำอะไรไม่ได้นอกจากดู)
                                    <div className="mt-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 p-4 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                                                รอการตรวจสอบ (Pending Approval)
                                            </h4>
                                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                                You can view details, but you cannot like, review, or share until it is approved.
                                            </p>
                                        </div>
                                    </div>

                                ) : (
                                    
                                    // 🔓 ส่วนแสดงผลสำหรับหมุดปกติ (Approved) -> โค้ดเดิมของคุณที่ปุ่มครบ
                                    <div className="grid grid-cols-4 gap-2 pt-2">
                                        
                                        {/* 1. ❤️ ปุ่ม Like */}
                                        <motion.button 
                                            whileTap={{ scale: 0.9 }} 
                                            onClick={() => handleLike(localSelectedLocation)} 
                                            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
                                        >
                                            <LikeIcon isLiked={userLikes.has(localSelectedLocation.id)} />
                                            <span className={`text-xs mt-1 font-medium ${userLikes.has(localSelectedLocation.id) ? 'text-pink-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {localSelectedLocation.likeCount || 0}
                                            </span>
                                        </motion.button>

                                        {/* 2. 💬 ปุ่ม Review */}
                                        <motion.button 
                                            whileTap={{ scale: 0.9 }} 
                                            onClick={() => setIsReviewsModalOpen(true)} 
                                            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition text-gray-500 dark:text-gray-400"
                                        >
                                            <ReviewIcon />
                                            <span className="text-xs mt-1 font-medium">Review</span>
                                        </motion.button>

                                        {/* 3. ฿ ปุ่ม Prices */}
                                        <motion.button 
                                            whileTap={{ scale: 0.9 }} 
                                            onClick={() => setShowPrices(prev => !prev)} 
                                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition ${showPrices ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400'}`}
                                        >
                                            {showPrices ? <ImageIcon /> : <PriceIcon />}
                                            <span className="text-xs mt-1 font-medium">{showPrices ? 'Info' : 'Prices'}</span>
                                        </motion.button>

                                        {/* 4. 🔗 ปุ่ม Share */}
                                        <motion.button 
                                            whileTap={{ scale: 0.9 }} 
                                            onClick={handleShare} 
                                            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition text-gray-500 dark:text-gray-400"
                                        >
                                            <ShareIcon />
                                            <span className="text-xs mt-1 font-medium">Share</span>
                                        </motion.button>

                                    </div>
                                )}
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
            {/* Pinning UI (Updated with Manual Input Button) */}
            {pinningMode && (
                <div className="absolute top-0 left-0 right-0 p-4 bg-blue-600 text-white z-20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                    
                    <p className="font-semibold text-lg text-center sm:text-left flex-1">
                        {tempPin ? '📍 The position has been selected. Click Confirm.' : '👇 Click or follow the coordinates.'}
                    </p>

                    <div className="flex gap-2">
                        {/* ⭐ ปุ่มกรอกพิกัดเอง (Input Coords) ⭐ */}
                        <button 
                            onClick={() => setShowManualInput(true)}
                            className="bg-white/20 hover:bg-white/30 text-white font-bold py-1.5 px-4 rounded-full text-sm border border-white/50 transition"
                        >
                            ✏️ coordinates
                        </button>

                        <button 
                            onClick={handleCancelPin} 
                            className="bg-white text-blue-600 font-bold py-1.5 px-4 rounded-full text-sm hover:bg-blue-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ⭐ Modal กรอกพิกัด (Manual Input Modal) ⭐ */}
            {showManualInput && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowManualInput(false)}>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">📍 Enter Coordinates</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Latitude</label>
                                <input 
                                    type="number" step="any" placeholder="13.xxxxxx"
                                    value={manualLat} onChange={e => setManualLat(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Longitude</label>
                                <input 
                                    type="number" step="any" placeholder="100.xxxxxx"
                                    value={manualLng} onChange={e => setManualLng(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowManualInput(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                            <button onClick={handleManualSubmit} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {tempPin && (<div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-4"><button onClick={handleConfirmPin} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 text-lg rounded-full shadow-lg">Confirm Pin</button><button onClick={handleCancelPin} className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-3 px-8 text-lg rounded-full shadow-lg">Cancel</button></div>)}
            {isAddLocationModalOpen && (<LocationFormModal initialCoords={tempPin} onSuccess={handleSubmissionSuccess} onClose={() => { setIsAddLocationModalOpen(false); setTempPin(null); }} />)}
            

            {/* Search Results Panel */}
            {searchQuery.length > 0 && (<div className="absolute top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 z-30 shadow-lg p-6 flex flex-col"><div className="relative flex items-center mb-4"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"><SearchIcon/></span><input type="text" className="w-full pl-10 pr-10 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none dark:bg-gray-700 dark:text-gray-100" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." autoFocus /><button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div><ul className="space-y-2 overflow-y-auto">{searchResults.map((loc) => (<li key={loc.id} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg" onClick={() => handleSearchResultClick(loc)}><div className="mr-3 text-gray-400 dark:text-gray-500">{loc.type === 'motorcycle' ? <MotorcycleIcon/> : <BusIcon/>}</div><span className="text-gray-700 dark:text-gray-200">{loc.name}</span></li>))}{searchResults.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-4">No results.</p>}</ul></div>)}

            {isMyPinsModalOpen && user && (
                <MyPinsModal 
                    user={user} 
                    onClose={() => setIsMyPinsModalOpen(false)} 
                    onSelectLocation={handleSelectMyPin} 
                />
            )}
            {/* ⭐ แสดง Modal Favorites ⭐ */}
            {isFavoritesModalOpen && user && (
                <FavoritesModal 
                    locations={locations} // ส่งข้อมูลหมุดทั้งหมดไป
                    userLikes={userLikes} // ส่งรายการ ID ที่ชอบไป
                    onClose={() => setIsFavoritesModalOpen(false)} 
                    onSelectLocation={(loc) => {
                        // ใช้ฟังก์ชันเดียวกับ My Pins ได้เลย เพื่อพุ่งไปหาหมุด
                        handleSelectMyPin(loc); 
                        setIsFavoritesModalOpen(false);
                    }} 
                />
            )}

            {/* User Menu Panel (Includes Dark Mode, Profile Edit, Guest Login) */}
            {/* --- ⭐ Sidebar Menu (Redesigned: Cosmic Command Center) ⭐ --- */}
            <div className={`fixed inset-y-0 left-0 w-72 bg-[#0f172a]/95 backdrop-blur-xl border-r border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* 1. Header & Profile Section (ส่วนหัว) */}
                <div className="relative p-6 pt-10 pb-8 overflow-hidden">
                    {/* แสงพื้นหลังตกแต่ง */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />

                    {/* ข้อมูล User */}
                    <div className="relative z-10 flex flex-col items-center">
                         {/* รูป Avatar (มีวงแหวนสีรุ้ง) */}
                        {/* รูป Avatar (มีวงแหวนสีรุ้ง) */}
                        <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 shadow-lg mb-3">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-slate-900">
                                {/* ⭐ ถ้ามีรูป ให้โชว์รูป ถ้าไม่มี ให้โชว์ตัวอักษร ⭐ */}
                                {user?.photoURL ? (
                                    <img 
                                        src={user.photoURL} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer" // 👈 ⭐ เติมบรรทัดนี้เข้าไปครับ
                                    />
                                ) : (
                                    <span className="text-3xl font-bold text-white">
                                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'G'}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* ชื่อและอีเมล */}
                        <h3 className="text-xl font-bold text-white tracking-wide truncate max-w-[200px] text-center">
                            {user?.displayName || (user?.email ? user.email.split('@')[0] : "Guest User")}
                        </h3>
                        {user && (
                            <p className="text-xs text-slate-400 mt-1 font-mono bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700 truncate max-w-[220px]">
                                {user.email}
                            </p>
                        )}
                        <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${user ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span> 
                            {user ? `Joined ${new Date(user.metadata.creationTime).toLocaleDateString()}` : 'Not Logged In'}
                        </p>
                    </div>

                    {/* ปุ่มปิด X (มุมขวาบน) */}
                    <button 
                        onClick={() => setMenuOpen(false)}
                        className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* 2. Menu Items (รายการเมนู) */}
                <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
                    {user ? (
                        <>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-2">Main Menu</p>
                            
                            {/* ปุ่ม Profile */}
                            <button 
                                onClick={() => {setIsProfileModalOpen(true); setMenuOpen(false);}} 
                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-slate-700"
                            >
                                <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors shadow-sm">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <span className="font-medium">My Profile</span>
                            </button>

                            {/* ปุ่ม My Pins */}
                            <button 
                                onClick={() => {
                                    setIsMyPinsModalOpen(true);
                                    setMenuOpen(false); // 👈 แก้ตรงนี้ครับ ปิดเมนูปุ๊บ เห็น Modal ปั๊บ
                                }} 
                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-slate-700"
                            >
                                <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-purple-600/20 group-hover:text-purple-400 transition-colors shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <span className="font-medium">My Pins</span>
                                </div>
                            </button>
                            {/* ⭐ ปุ่ม Favorites (เพิ่มตรงนี้) ⭐ */}
                            <button 
                                onClick={() => {
                                    setIsFavoritesModalOpen(true);
                                    setMenuOpen(false);
                                }} 
                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-slate-700"
                            >
                                <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-pink-600/20 group-hover:text-pink-400 transition-colors shadow-sm">
                                    {/* ไอคอนหัวใจ */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <span className="font-medium">Favorites</span>
                                </div>
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-10 px-4">
                            <p className="text-slate-400 text-sm mb-4">Please login to access more features.</p>
                            <button 
                                onClick={() => setView('welcome')} 
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all"
                            >
                                Login / Sign Up
                            </button>
                        </div>
                    )}
                </div>

                {/* 3. Footer / Logout (ปุ่มล็อกเอาท์) */}
                {user && (
                    <div className="p-6 border-t border-slate-800 bg-[#0f172a]/80">
                        <button 
                            onClick={handleSignOut} 
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded-2xl transition-all border border-red-500/20 hover:border-red-500/40 shadow-lg hover:shadow-red-900/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            <span className="font-bold">Log Out</span>
                        </button>
                        <p className="text-[10px] text-center text-slate-600 mt-4 font-mono tracking-wider opacity-50">
                            EASYWAY v1.0 • SPACE EDITION 🚀
                        </p>
                    </div>
                )}
            </div>
            {isMenuOpen && <div onClick={() => setMenuOpen(false)} className="absolute inset-0 z-20 bg-black/40"></div>}

            {/* Map Controls Overlay */}
            <div className="absolute inset-0 p-4 md:p-6 flex flex-col pointer-events-none">
                <div className="w-full flex justify-between items-start pointer-events-auto"><button onClick={() => setMenuOpen(true)} className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><MenuIcon /></button><div className="text-center"><h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>EasyWay</h1></div><div className="w-12"></div></div>
                <div className="mt-4 w-full max-w-lg mx-auto pointer-events-auto"><div className="relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg"><input type="text" placeholder="Search..." className="w-full py-3 pl-5 pr-12 rounded-full focus:outline-none dark:bg-gray-800 dark:text-gray-100" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><button className="absolute right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"><SearchIcon /></button></div></div>
                <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col space-y-2 pointer-events-auto">
                    <button onClick={moveToCurrentLocation} className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><TargetIcon /></button>
                    <div className="bg-white dark:bg-gray-800 rounded-full shadow-md"><button onClick={handleZoomIn} className="p-3 block text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-full"><PlusIcon /></button><hr className="dark:border-gray-600"/><button onClick={handleZoomOut} className="p-3 block text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-full"><MinusIcon /></button></div>
                    {/* ... ในส่วน Map Controls ... */}
                    <div className="bg-white dark:bg-gray-800 rounded-full shadow-md flex flex-col overflow-hidden">
                        
                        {/* 🚌 ปุ่มสองแถว (ให้ไอคอนเป็นสีน้ำเงิน "ตลอดเวลา") */}
                        <button 
                            onClick={() => setFilterType(prev => prev === 'songthaew' ? 'all' : 'songthaew')} 
                            className={`p-3 transition-colors ${
                                filterType === 'songthaew' 
                                ? 'bg-blue-100 dark:bg-blue-900/50' // ถ้าเลือกอยู่: พื้นหลังฟ้า
                                : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700' // ถ้าไม่เลือก: พื้นใส
                            }`}
                        >
                            {/* ⭐ ใส่สีที่ตัวไอคอนเลย (text-blue-600) ไม่ต้องรอ hover */}
                            <div className="text-blue-600 dark:text-blue-400">
                                <BusIcon />
                            </div>
                        </button>

                        <hr className="border-gray-200 dark:border-gray-700"/>

                        {/* 🛵 ปุ่มวิน (ให้ไอคอนเป็นสีแดง "ตลอดเวลา") */}
                        <button 
                            onClick={() => setFilterType(prev => prev === 'motorcycle' ? 'all' : 'motorcycle')} 
                            className={`p-3 transition-colors ${
                                filterType === 'motorcycle' 
                                ? 'bg-red-100 dark:bg-red-900/50' // ถ้าเลือกอยู่: พื้นหลังแดง
                                : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700' // ถ้าไม่เลือก: พื้นใส
                            }`}
                        >
                            {/* ⭐ ใส่สีที่ตัวไอคอนเลย (text-red-600) ไม่ต้องรอ hover */}
                            <div className="text-red-600 dark:text-red-400">
                                <MotorcycleIcon />
                            </div>
                        </button>

                    </div>
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

                // --- ⭐⭐ แก้ไขตรงนี้ครับ (เช็ก Deep Link) ⭐⭐ ---
                const searchParams = new URLSearchParams(window.location.search);
                const hasSharedPin = searchParams.has('pin'); // ดูว่ามี ?pin=... ไหม

                if (hasSharedPin) {
                    // ถ้ามีลิงก์แชร์มา ให้ข้ามไปหน้า Map เลย (เป็น Guest)
                    setView('map'); 
                } else {
                    // ถ้าไม่มีลิงก์ และไม่ได้อยู่หน้า Login/SignUp/Loading ให้กลับไป Welcome
                    if (!isLoadingMap && view !== 'login' && view !== 'signup') {
                        setView('welcome');
                    }
                }
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