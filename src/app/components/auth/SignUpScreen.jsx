"use client";
import React, { useState } from 'react';
import { auth, db } from '@/app/firebase/firebase';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { CloseButton } from '@/app/components/ui/Icons';

export default function SignUpScreen({ setView }) {
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
                createdAt: serverTimestamp(),
                status: 'active',
                displayName: email.split('@')[0]
            });
            await updateProfile(user, { displayName: email.split('@')[0] });
        } catch (err) {
            setError("Failed to create an account. The email may already be in use.");
            console.error(err);
        }
    };

    return (
        <div className="w-screen h-screen flex bg-white dark:bg-gray-900 bg-gradient-to-br from-sky-200 to-blue-300 dark:from-sky-800 dark:to-blue-900">
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