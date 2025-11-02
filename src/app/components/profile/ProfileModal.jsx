"use client";
import React, { useState } from 'react';
import { auth, db } from '@/app/firebase/firebase';
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export default function ProfileModal({ user, onClose }) {
    const [displayName, setDisplayName] = useState(user?.displayName || user?.email?.split('@')[0] || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleProfileUpdate = async (e) => { 
        e.preventDefault(); 
        setMessage(''); 
        setError(''); 
        if (!user) return; 
        if (displayName.trim() === '') { setError('Display name cannot be empty.'); return; } 
        setLoading(true); 
        try { 
            await updateProfile(auth.currentUser, { displayName: displayName.trim() }); 
            const userRef = doc(db, "users", user.uid); 
            await updateDoc(userRef, { displayName: displayName.trim() }); 
            setMessage('Profile updated!'); 
            setTimeout(onClose, 1500); 
        } catch (err) { 
            setError('Failed to update.'); 
            console.error("Profile update error:", err); 
        } finally { 
            setLoading(false); 
        } 
    };

    return ( 
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}> 
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}> 
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Edit Profile</h2> 
                <form onSubmit={handleProfileUpdate}>
                    {message && <p className="mb-4 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 p-3 rounded">{message}</p>}
                    {error && <p className="mb-4 text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-3 rounded">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Display Name</label>
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 focus:ring-opacity-50" required />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded transition duration-300">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-400 transition duration-300">{loading ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form> 
            </div> 
        </div> 
    );
};