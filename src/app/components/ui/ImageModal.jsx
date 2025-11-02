"use client";
import React from 'react';

export default function ImageModal({ imageUrl, onClose }) {
    if (!imageUrl) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <img src={imageUrl} alt="Full screen location" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
            <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
        </div>
    );
};