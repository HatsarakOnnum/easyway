"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/app/firebase/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { StarRatingDisplay, StarRatingInput } from './StarRating';
import { StarIcon } from '@/app/components/ui/Icons';

export default function ReviewsModal({ location, user, onClose }) {
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
            setLoading(false); 
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
            
            // เคลียร์ Input ทันที
            setNewReviewText(''); 
            setNewRating(0);

            // คำนวณค่าใหม่
            const locationRef = doc(db, "locations", location.id);
            const currentReviewCount = location.reviewCount || 0;
            const currentAvgRating = location.avgRating || 0;
            const newCount = currentReviewCount + 1;
            const newAvg = (currentAvgRating * currentReviewCount + newRating) / newCount;

            // พยายามอัปเดต Location (แยก try...catch)
            try {
                await updateDoc(locationRef, { 
                    reviewCount: newCount, 
                    avgRating: isNaN(newAvg) ? currentAvgRating : newAvg 
                });
            } catch (updateError) {
                console.error("Error updating location stats after review:", updateError);
            }
        } catch (addError) {
            console.error("Error adding review document:", addError);
            setError("Failed to submit review. Please try again.");
        }
    };

    return ( 
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}> 
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}> 
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold dark:text-white">Reviews for {location.name}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-3xl font-bold">&times;</button>
                </div> 
                <div className="p-4 overflow-y-auto">
                    {loading && <p className="dark:text-gray-300">Loading...</p>}
                    {!loading && reviews.length === 0 && <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>}
                    <div className="space-y-4">
                        {reviews.map(review => (
                            <div key={review.id} className="border-b dark:border-gray-700 pb-3 last:border-b-0">
                                <div className="flex items-center mb-1">
                                    {/* --- ⭐⭐ โค้ดวาดดาวโดยตรง (แก้ปัญหา 0 reviews) ⭐⭐ --- */}
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => {
                                            const ratingValue = i + 1;
                                            return <StarIcon
                                                        key={i}
                                                        className={`h-5 w-5 ${ratingValue <= review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                                        filled
                                                    />;
                                        })}
                                    </div>
                                    <p className="ml-auto text-sm text-gray-500 dark:text-gray-400">{review.createdAt?.toDate().toLocaleDateString()}</p>
                                </div>
                                <p className="font-semibold text-sm dark:text-gray-200">{review.userName || review.userEmail.split('@')[0]}</p>
                                <p className="text-gray-700 dark:text-gray-300 mt-1">{review.text}</p>
                            </div>
                        ))}
                    </div>
                </div> 
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-bold text-lg mb-2 dark:text-white">Write a Review</h3>
                    {user ? (
                        <form onSubmit={handleSubmitReview}>
                            {error && <p className="text-red-500 dark:text-red-400 text-sm mb-2">{error}</p>}
                            <div className="mb-2"><StarRatingInput rating={newRating} setRating={setNewRating} /></div>
                            <textarea value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="3" placeholder="Share your experience..."></textarea>
                            <button type="submit" className="mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600">Submit</button>
                        </form>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">Log in to write review.</p>
                    )}
                </div> 
            </div> 
        </div> 
    );
};