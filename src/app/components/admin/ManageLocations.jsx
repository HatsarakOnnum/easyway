"use client";
import React, { useState, useEffect } from 'react';
import { db, storage } from '@/app/firebase/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";
import { ref as storageRef, deleteObject } from "firebase/storage";
import LocationFormModal from '@/app/components/locations/LocationFormModal'; // (คุณต้องสร้างไฟล์นี้ด้วย)

export default function ManageLocations({ onViewLocation }) {
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

    const handleDelete = async (locationToDelete) => {
        if (!locationToDelete || !locationToDelete.id) return;
        const locationId = locationToDelete.id;
        const locationName = locationToDelete.name;

        if (window.confirm(`Are you sure you want to delete "${locationName}"? This also deletes its image, reports, and reviews.`)) {
            try {
                if (locationToDelete.imageUrl) {
                    try {
                        const imageRef = storageRef(storage, locationToDelete.imageUrl);
                        await deleteObject(imageRef);
                        console.log(`Image deleted from Storage: ${locationName}`);
                    } catch (storageError) { /* ... */ }
                }

                const reportsQuery = query(collection(db, "reports"), where("locationId", "==", locationId));
                const reportSnapshots = await getDocs(reportsQuery);
                const deletePromises = reportSnapshots.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deletePromises);
                console.log(`Deleted ${reportSnapshots.size} reports for: ${locationName}`);

                const reviewsQuery = query(collection(db, "reviews"), where("locationId", "==", locationId));
                const reviewSnapshots = await getDocs(reviewsQuery);
                const deleteReviewPromises = reviewSnapshots.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deleteReviewPromises);
                console.log(`Deleted ${reviewSnapshots.size} reviews for: ${locationName}`);

                await deleteDoc(doc(db, "locations", locationId));
                console.log(`Location document deleted: ${locationName}`);
                alert(`"${locationName}", image, reports, and reviews deleted.`);
            } catch (error) {
                console.error(`Error deleting ${locationName}:`, error);
                alert(`Failed to fully delete "${locationName}". Check console.`);
            }
        }
    };

    const handleApprove = async (id) => {
        const locRef = doc(db, "locations", id);
        await updateDoc(locRef, { status: 'approved' });
    };

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dark:text-gray-200">
            {/* ... (JSX ของ ManageLocations) ... */}
            {isModalOpen && <LocationFormModal currentLocation={currentLocation} onClose={handleCloseModal} onSuccess={handleCloseModal}/>}
        </div>
    );
};