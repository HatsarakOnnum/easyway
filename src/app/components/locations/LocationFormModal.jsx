"use client";
import React, { useState } from 'react';
import { auth, db, storage } from '@/app/firebase/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export default function LocationFormModal({ currentLocation, onClose, initialCoords, onSuccess }) {
    const [name, setName] = useState(currentLocation?.name || '');
    const [lat, setLat] = useState(currentLocation?.lat || initialCoords?.lat || '');
    const [lng, setLng] = useState(currentLocation?.lng || initialCoords?.lng || '');
    const [type, setType] = useState(currentLocation?.type || 'motorcycle');
    const [routes, setRoutes] = useState(currentLocation?.routes || [{ destination: '', price: '' }]);
    const [imageFile, setImageFile] = useState(null);
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
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
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
            onSuccess(); // Call onSuccess callback
        } catch (err) {
            console.error("Error submitting location:", err); setError("Failed to submit. Please try again.");
        } finally { setUploading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h3 className="text-xl font-bold mb-4 dark:text-white">{currentLocation ? 'Edit Location' : 'Add New Location'}</h3>
                    {error && <p className="text-red-500 dark:text-red-400 text-sm mb-2">{error}</p>}
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div><label className="block dark:text-gray-300">Pin Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required /></div>
                        <div className="flex space-x-4">
                            <div className="w-1/2"><label className="block dark:text-gray-300">Latitude</label><input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} className="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" readOnly required /></div>
                            <div className="w-1/2"><label className="block dark:text-gray-300">Longitude</label><input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} className="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" readOnly required /></div>
                        </div>
                        <div><label className="block dark:text-gray-300">Type</label><select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"><option value="motorcycle">วินมอเตอร์ไซค์</option><option value="songthaew">สองแถว</option></select></div>
                        <div><label className="block dark:text-gray-300">Location Image</label><input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"/>{imageFile ? <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selected: {imageFile.name}</p> : (currentLocation?.imageUrl && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current image exists. Upload new to replace.</p>)}</div>
                        <div><h4 className="font-semibold mt-4 dark:text-white">Places & Prices</h4>{routes.map((route, index) => (<div key={index} className="flex items-center space-x-2 mt-2"><input type="text" placeholder="Place" value={route.destination} onChange={e => handleRouteChange(index, 'destination', e.target.value)} className="w-1/2 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" /><input type="number" placeholder="Price" value={route.price} onChange={e => handleRouteChange(index, 'price', e.target.value)} className="w-1/3 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" /><button type="button" onClick={() => removeRoute(index)} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">-</button></div>))}<button type="button" onClick={addRoute} className="mt-2 bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded text-sm dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500">+ Add Route</button></div>
                    </div>
                    <div className="flex justify-end mt-6 pt-4 border-t dark:border-gray-700"><button type="button" onClick={onClose} className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded mr-2">Cancel</button><button type="submit" disabled={uploading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300 dark:disabled:bg-blue-800">{uploading ? 'Saving...' : 'Save'}</button></div>
                </form>
            </div>
        </div>
    );
};