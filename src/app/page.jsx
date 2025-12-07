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
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    uid: user.uid, email: user.email, displayName: user.displayName || user.email.split('@')[0],
                    createdAt: serverTimestamp(), status: 'active' 
                });
            } else if (userSnap.data().status === 'suspended') {
                setError("บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแล");
                await signOut(auth); return;
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
                
                {/* ⭐⭐ แก้ไข Layout ตรงนี้ครับ ⭐⭐ */}
                <div className="flex flex-col w-full md:w-auto gap-3 md:flex-row md:items-center">
                    
                    {/* ช่องค้นหา (เต็มจอในมือถือ) */}
                    <input
                        type="text"
                        placeholder="Search by email..."
                        className="w-full md:w-64 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* กลุ่มปุ่ม (Date + Add User) */}
                    <div className="flex gap-2 w-full md:w-auto">
                        {/* ปุ่ม Sort Date */}
                        <button 
                            onClick={toggleSortOrder} 
                            className="flex-1 md:flex-none justify-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded flex items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap"
                        >
                            <span className="mr-2">{sortOrder === 'desc' ? '⬇' : '⬆'}</span> Date
                        </button>

                        {/* ปุ่ม Add User */}
                        <button 
                            onClick={() => handleOpenModal()} 
                            className="flex-1 md:flex-none justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
                        >
                            Add User
                        </button>
                    </div>
                </div>
                {/* --------------------------------- */}
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

        const confirmMessage = isPending 
            ? `Are you sure you want to REJECT "${locationName}"? This will notify the user and remove the pin.` 
            : `Are you sure you want to DELETE "${locationName}"? This cannot be undone.`;

        if (window.confirm(confirmMessage)) {
            try {
                const locationRef = doc(db, "locations", locationId);

                // --- ⭐ ส่งแจ้งเตือน (ทำแค่ครั้งเดียวที่นี่) ⭐ ---
                // เช็กว่ามีคนส่ง และ คนส่ง "ไม่ใช่" Admin คนปัจจุบัน
                if (locationToDelete.submittedBy && locationToDelete.submittedBy !== auth.currentUser.uid) {
                    const message = isPending 
                        ? `Your location submission "${locationName}" was rejected by admin.`
                        : `Your location "${locationName}" has been removed by the administrator.`;
                    
                    await addDoc(collection(db, "users", locationToDelete.submittedBy, "notifications"), {
                        type: 'rejected', 
                        locationName: locationName,
                        message: message,
                        createdAt: serverTimestamp(),
                        read: false
                    });
                }
                // ------------------------------------------------

                // 2. ลบรูปภาพ
                if (locationToDelete.imageUrl) {
                    try {
                        const imageRef = storageRef(storage, locationToDelete.imageUrl);
                        await deleteObject(imageRef);
                    } catch (err) { 
                        if (err.code !== 'storage/object-not-found') console.error("Image delete error:", err); 
                    }
                }

                // 3. ลบ Reports & Reviews
                const deleteSubCollection = async (collName) => {
                    const q = query(collection(db, collName), where("locationId", "==", locationId));
                    const snapshot = await getDocs(q);
                    const promises = snapshot.docs.map(doc => deleteDoc(doc.ref));
                    await Promise.all(promises);
                };
                await deleteSubCollection("reports");
                await deleteSubCollection("reviews");

                // 4. ลบเอกสาร Location (สุดท้าย)
                await deleteDoc(locationRef);

                console.log(`Location deleted: ${locationName}`);
                toast.success(`ลบ "${locationName}" เรียบร้อยแล้ว`); // ใช้ Toast แจ้ง Admin

            } catch (error) {
                console.error(`Error processing ${locationName}:`, error);
                toast.error(`เกิดข้อผิดพลาดในการลบ "${locationName}"`);
            }
        }
    };

    const handleApprove = async (location) => { 
        try {
            const locRef = doc(db, "locations", location.id);
            await updateDoc(locRef, { status: 'approved' });

            // --- ⭐ ส่งแจ้งเตือน (ทำแค่ครั้งเดียวที่นี่) ⭐ ---
            // เช็กว่ามีคนส่ง และ คนส่ง "ไม่ใช่" Admin คนปัจจุบัน
            if (location.submittedBy && location.submittedBy !== auth.currentUser.uid) {
                await addDoc(collection(db, "users", location.submittedBy, "notifications"), {
                    type: 'approved',
                    locationName: location.name,
                    message: "Your location has been approved and is now visible!",
                    createdAt: serverTimestamp(),
                    read: false
                });
            }
            // ------------------------------------------------

            toast.success(`อนุมัติ "${location.name}" เรียบร้อย!`);
            // 🎉 จุดพลุให้ Admin ด้วย
            confetti({
                particleCount: 100,
                spread: 60,
                origin: { y: 0.6 }
            });

        } catch (error) {
            console.error("Error approving:", error);
            toast.error("ไม่สามารถอนุมัติได้");
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

// --- Component: ManageReviews (สำหรับจัดการรีวิว) ---
// --- Component: ManageReviews (Updated: Show Location Name + Search) ---
const ManageReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [locationsMap, setLocationsMap] = useState({}); // เก็บจับคู่ ID -> Name
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // 1. ดึงข้อมูล Reviews
        const qReviews = query(collection(db, "reviews"));
        const unsubscribeReviews = onSnapshot(qReviews, (snapshot) => {
            setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // 2. ดึงข้อมูล Locations (เพื่อเอาชื่อหมุดมาแสดง)
        const qLocations = query(collection(db, "locations"));
        const unsubscribeLocations = onSnapshot(qLocations, (snapshot) => {
            const locMap = {};
            snapshot.forEach(doc => {
                locMap[doc.id] = doc.data().name; // จับคู่ ID กับชื่อ
            });
            setLocationsMap(locMap);
        });

        return () => {
            unsubscribeReviews();
            unsubscribeLocations();
        };
    }, []);

    // รับ locationId มาด้วย เพื่อจะไปดึงข้อมูลมานับใหม่
    const handleDeleteReview = async (reviewId, locationId) => {
        if (!window.confirm("Are you sure you want to delete this review? This will recalculate the location's rating.")) {
            return;
        }

        try {
            // 1. ลบรีวิวออกจาก Collection reviews
            await deleteDoc(doc(db, "reviews", reviewId));
            
            // 2. --- เริ่มกระบวนการคำนวณใหม่ (Recalculate) ---
            
            // ดึงรีวิว "ที่เหลืออยู่" ทั้งหมดของ Location นี้
            const q = query(collection(db, "reviews"), where("locationId", "==", locationId));
            const querySnapshot = await getDocs(q);

            // คำนวณค่าใหม่
            const newCount = querySnapshot.size; // จำนวนรีวิวที่เหลือ
            let totalRating = 0;
            querySnapshot.forEach((doc) => {
                totalRating += doc.data().rating || 0;
            });
            
            // หาค่าเฉลี่ย (ถ้าไม่มีรีวิวเหลือเลย ให้เป็น 0)
            const newAvg = newCount > 0 ? totalRating / newCount : 0;

            // 3. บันทึกค่าสถิติใหม่ลงไปที่ Location
            const locationRef = doc(db, "locations", locationId);
            await updateDoc(locationRef, {
                reviewCount: newCount,
                avgRating: newAvg
            });

            toast.success("Review deleted and stats updated!");

        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Failed to delete review or update stats.");
        }
    };

    // --- Logic การกรองข้อมูล (Search) ---
    const filteredReviews = reviews.filter(review => {
        // หาชื่อหมุดจาก ID
        const locationName = locationsMap[review.locationId] || ''; 
        // เช็กว่าชื่อหมุด ตรงกับคำค้นหาหรือไม่ (ค้นหาจากชื่อ User ได้ด้วยถ้าต้องการ)
        return locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (review.userName && review.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return (
        <div className="dark:text-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
                <h2 className="text-3xl font-bold">Manage Reviews</h2>
                
                {/* --- ⭐ ช่องค้นหา (Search Bar) ⭐ --- */}
                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Location Name..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            {/* 📱 Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredReviews.map((review) => (
                    <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                        
                        {/* แสดงชื่อหมุด (Location Name) */}
                        <div className="mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Review for:</p>
                            <p className="font-bold text-blue-600 dark:text-blue-400 truncate">
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
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 italic">"{review.text}"</p>
                        <button onClick={() => handleDeleteReview(review.id, review.locationId)} className="w-full py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100 hover:bg-red-100 transition">
                            Delete Review
                        </button>
                    </div>
                ))}
            </div>

            {/* 💻 Desktop View (Table) */}
            <div className="hidden md:block bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            {/* เพิ่มคอลัมน์ Location Name */}
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Location</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Review</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReviews.map((review) => (
                            <tr key={review.id}>
                                {/* แสดงชื่อหมุด */}
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                                    <p className="text-blue-600 dark:text-blue-400 font-semibold">
                                        {locationsMap[review.locationId] || 'Unknown'}
                                    </p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                                    <p className="text-gray-900 dark:text-white font-bold">{review.userName}</p>
                                    <p className="text-gray-500 text-xs">{review.userEmail}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
                                    <p className="text-gray-700 dark:text-gray-300">{review.text}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center">
                                    <div className="flex justify-center">
                                         {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} className={`h-4 w-4 ${i + 1 <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} filled />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center">
                                    <button onClick={() => handleDeleteReview(review.id, review.locationId)} className="text-red-600 hover:text-red-900 font-bold bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Component: ManageReports (Updated: Beautiful Mobile Cards) ---
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
            <h2 className="text-3xl font-bold mb-6">Manage Reports</h2>

            {/* 📱 Mobile View (Cards) - แสดงเฉพาะบนมือถือ */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {reports.map(report => (
                    <div key={report.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        
                        {/* แถบสีสถานะด้านซ้าย */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${report.status === 'resolved' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>

                        {/* Header: ชื่อสถานที่ + วันที่ */}
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

                        {/* Body: ข้อความรายงาน */}
                        <div className="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl mb-4 ml-2 border border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                                "{report.reportText}"
                            </p>
                        </div>

                        {/* Footer: User & Actions */}
                        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-3 pl-2">
                            <div className="text-xs text-gray-400 w-full sm:w-auto">
                                <span className="font-semibold text-gray-500 dark:text-gray-400">By:</span> {report.userEmail}
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                {/* Dropdown เปลี่ยนสถานะ */}
                                <div className="relative flex-1 sm:flex-none">
                                    <select 
                                        value={report.status} 
                                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                        className="w-full appearance-none bg-gray-100 dark:bg-gray-700 border-none text-gray-700 dark:text-gray-200 text-sm font-medium py-2 pl-3 pr-8 rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="pending">⏳ Pending</option>
                                        <option value="resolved">✅ Resolved</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>

                                {/* ปุ่มลบ */}
                                <button 
                                    onClick={() => handleDelete(report.id)} 
                                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors"
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

            {/* 💻 Desktop View (Table) - แสดงเฉพาะบนจอใหญ่ (เหมือนเดิม) */}
            <div className="hidden md:block bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
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
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white">{report.locationName}</td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm max-w-xs break-words text-gray-600 dark:text-gray-300">{report.reportText}</td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-500">{report.userEmail}</td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-500">{report.createdAt?.toDate().toLocaleString()}</td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center">
                                    <select
                                        value={report.status} onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                        className={`py-1 px-2 rounded text-xs font-bold border-none cursor-pointer outline-none ${report.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'}`}
                                    >
                                        <option value="pending">Pending</option> <option value="resolved">Resolved</option>
                                    </select>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-center">
                                    <button onClick={() => handleDelete(report.id)} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition">
                                        <TrashIcon />
                                    </button>
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
            case 'reviews': return <ManageReviews />; // <-- ⭐ เพิ่มบรรทัดนี้ ⭐
            default: return <ManageUsers />;
        }
    };

    // ... ใน function AdminDashboard ...

    return (
        // เปลี่ยน layout: มือถือเป็นแนวตั้ง (col), จอคอมเป็นแนวนอน (row)
        <div className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-900">
            <Toaster position="top-right" reverseOrder={false} />
            
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
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('reviews'); setViewingLocation(null);}} className={`p-2 rounded whitespace-nowrap ${view === 'reviews' && !viewingLocation ? 'bg-gray-700 dark:bg-gray-800' : 'hover:bg-gray-700 dark:hover:bg-gray-800'}`}>Reviews</a>
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
                                    onClick={() => openImageModal(localSelectedLocation.imageUrl)}
                                />
                                {/* --- ⭐ 1. ปุ่ม Report (ย้ายมาซ่อนตรงนี้ มุมซ้ายบน) ⭐ --- */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => { if (user) { setIsReportModalOpen(true) } else { toast.error('กรุณาเข้าสู่ระบบเพื่อรายงาน') } }}
                                    className="absolute top-3 left-3 bg-black/40 hover:bg-red-600/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                                    title="Report this location"
                                >
                                    <FlagIcon />
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
                                <div className="grid grid-cols-4 gap-2 pt-2">
                                    
                                    {/* 1. ❤️ ปุ่ม Like */}
                                    <motion.button 
                                        whileTap={{ scale: 0.9 }} 
                                        onClick={() => handleLike(localSelectedLocation)} 
                                        className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
                                    >
                                        <LikeIcon isLiked={userLikes.has(localSelectedLocation.id)} />
                                        <span className={`text-xs mt-1 font-medium ${userLikes.has(localSelectedLocation.id) ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>
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