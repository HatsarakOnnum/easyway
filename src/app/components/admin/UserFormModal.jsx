"use client";
import React, { useState } from 'react';
import { auth, db } from '@/app/firebase/firebase';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function UserFormModal({ currentUser, onClose }) {
    const [email, setEmail] = useState(currentUser?.email || '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (currentUser) {
            const userRef = doc(db, "users", currentUser.id);
            await updateDoc(userRef, { email: email });
            onClose();
        } else {
            if (password.length < 6) {
                setError("Password should be at least 6 characters."); return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid, email: user.email, createdAt: serverTimestamp(), status: 'active', displayName: email.split('@')[0]
                });
                await updateProfile(user, { displayName: email.split('@')[0] });
                onClose();
            } catch (err) {
                setError("Failed to create user. Email might exist."); console.error(err);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* ... (JSX ของ UserFormModal) ... */}
        </div>
    )
};