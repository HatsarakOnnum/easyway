"use client";
import React, { useState } from 'react';
import { db } from '@/app/firebase/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ReportModal({ location, user, onClose }) {
    const [reportText, setReportText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleReportSubmit = async (e) => { 
        e.preventDefault(); 
        if (!user) { setError('Log in to report.'); return; } 
        if (reportText.trim() === '') { setError('Please describe issue.'); return; } 
        setError(''); 
        setIsSubmitting(true); 
        try { 
            await addDoc(collection(db, 'reports'), { 
                locationId: location.id, 
                locationName: location.name, 
                reportText: reportText, 
                userId: user.uid, 
                userEmail: user.email, 
                createdAt: serverTimestamp(), 
                status: 'pending' 
            }); 
            alert('Report submitted.'); 
            onClose(); 
        } catch (err) { 
            console.error('Report error:', err); 
            setError('Failed to submit.'); 
        } finally { 
            setIsSubmitting(false); 
        } 
    };

    return ( 
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}> 
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}> 
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold dark:text-white">Report Issue</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-3xl font-bold">&times;</button>
                </div> 
                <form onSubmit={handleReportSubmit} className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Reporting: <span className="font-semibold dark:text-gray-200">{location.name}</span></p>
                    <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="4" placeholder="Describe problem..." required></textarea>
                    {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
                    <div className="flex justify-end mt-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded transition duration-300 mr-2">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:bg-red-300 dark:disabled:bg-red-800 transition duration-300">{isSubmitting ? 'Submitting...' : 'Submit Report'}</button>
                    </div>
                </form> 
            </div> 
        </div> 
    );
};