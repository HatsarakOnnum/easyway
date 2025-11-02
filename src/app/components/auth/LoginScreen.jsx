"use client";
import React, { useState } from 'react';
import { auth, db } from '@/app/firebase/firebase';
import { 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { EyeIcon, GoogleIcon, CloseButton } from '@/app/components/ui/Icons';
import PasswordResetModal from './PasswordResetModal';

export default function LoginScreen({ setView }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);

    const handleLogin = async (e) => {
        console.log("handleLogin: เริ่มทำงาน");
        e.preventDefault();
        setError('');
        try {
            console.log("handleLogin: กำลังเรียก signInWithEmailAndPassword...");
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("handleLogin: signInWithEmailAndPassword สำเร็จ!");

            console.log("handleLogin: กำลังเช็ก status ใน Firestore...");
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists() && userSnap.data().status === 'suspended') {
                console.log("handleLogin: ตรวจพบ status 'suspended'");
                setError("บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแล");
                await signOut(auth); 
                return;
            }
            console.log("handleLogin: สถานะปกติ, ให้ App.js ทำงานต่อ");
        } catch (err) {
            console.error("Login Error Code:", err.code); 
            if (err.code === 'auth/user-disabled') {
                setError("บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแล");
            } else {
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
                console.log("Google Sign-In: ผู้ใช้ใหม่, กำลังสร้างเอกสาร...");
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    createdAt: serverTimestamp(),
                    status: 'active' 
                });
                console.log("Google Sign-In: สร้างเอกสารเรียบร้อย");
            } else if (userSnap.data().status === 'suspended') {
                console.log("Google Sign-In: ตรวจพบ status 'suspended', กำลังเตะออก...");
                setError("บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแล");
                await signOut(auth);
                return;
            } else {
                console.log("Google Sign-In: ผู้ใช้เดิม สถานะ 'active', ล็อกอินปกติ");
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
            <div className="w-screen h-screen flex bg-white dark:bg-gray-900 bg-gradient-to-br from-sky-200 to-blue-300 dark:from-sky-800 dark:to-blue-900">
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
                                <span className="px-2  text-gray-600 dark:text-gray-400 font-bold">
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